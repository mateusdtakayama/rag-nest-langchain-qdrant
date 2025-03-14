import { Injectable } from '@nestjs/common';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { AskQuestionRequestDto } from '@src/agent/http/dto/request/ask-question-request.dto';
import { ChatOpenAI } from '@langchain/openai';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { convertToOpenAIFunction } from '@langchain/core/utils/function_calling';
import { RunnableSequence } from '@langchain/core/runnables';
import { formatToOpenAIFunctionMessages } from 'langchain/agents/format_scratchpad';
import { OpenAIFunctionsAgentOutputParser } from 'langchain/agents/openai/output_parser';
import { AgentExecutor, type AgentStep } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ConfigService } from '@src/shared/module/config/config.service';

@Injectable()
export class AgentService {
  constructor(private readonly configService: ConfigService) {}

  async generate(askQuestionRequestDto: AskQuestionRequestDto) {
    try {
      const ragData = await this.retrieve(askQuestionRequestDto.query);

      const prompt = this.createPrompt(ragData.content);
      const modelWithFunctions = this.createModelWithFunctions();

      const runnableAgent = this.createRunnableAgent(
        prompt,
        modelWithFunctions,
      );
      const executor = this.createExecutor(runnableAgent);

      const result = await executor.invoke({
        input: askQuestionRequestDto.query,
      });

      return {
        answer: result.output,
        sources: ragData.metadata,
      };
    } catch (error) {
      console.error('Error during question generation:', error);
      throw new Error('Failed to generate answer');
    }
  }

  private async retrieve(query: string) {
    const embeddings = this.createEmbeddings();
    const vectorStore = await this.createVectorStore(embeddings);
    const retriever = vectorStore.asRetriever({ k: 3 });

    const result = await retriever.invoke(query);
    return this.formatRetrieverResult(result);
  }

  private createPrompt(sources: string[]) {
    const template = `You are a chatbot that answers questions. Use the sources below to answer the questions. If a link is provided in the query, use the web tool to search for additional information from the link. -sources- Question:`;
    const sourcesFormatted = this.formatSources(sources);

    return ChatPromptTemplate.fromMessages([
      ['system', template.replace('-sources-', sourcesFormatted)],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);
  }

  private createModelWithFunctions() {
    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    const tools = [new TavilySearchResults({ maxResults: 1 })];
    return llm.bind({
      functions: tools.map((tool) => convertToOpenAIFunction(tool)),
    });
  }

  private createRunnableAgent(prompt, modelWithFunctions) {
    return RunnableSequence.from([
      {
        input: (i: { input: string; steps: AgentStep[] }) => i.input,
        agent_scratchpad: (i: { input: string; steps: AgentStep[] }) =>
          formatToOpenAIFunctionMessages(i.steps),
      },
      prompt,
      modelWithFunctions,
      new OpenAIFunctionsAgentOutputParser(),
    ]);
  }

  private createExecutor(runnableAgent) {
    const tools = [new TavilySearchResults({ maxResults: 1 })];
    return AgentExecutor.fromAgentAndTools({
      agent: runnableAgent,
      tools,
    });
  }

  private createEmbeddings() {
    return new OpenAIEmbeddings({
      model: 'text-embedding-ada-002',
      openAIApiKey: this.configService.get('openai_api_key'),
    });
  }

  private async createVectorStore(embeddings: OpenAIEmbeddings) {
    return await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: this.configService.get('qdrant_url'),
      collectionName: this.configService.get('qdrant_collection_name'),
      apiKey: this.configService.get('qdrant_api_key'),
      contentPayloadKey: 'page_content',
    });
  }

  private formatSources(content: string[]) {
    return JSON.stringify(content, null, 2).replace(/[{}]/g, '');
  }

  private formatRetrieverResult(result: any) {
    const metadata = result.map((doc) => ({
      title: doc.metadata.title,
      url: doc.metadata.url,
      date: doc.metadata.date,
    }));

    const content = result.map((doc) => doc.pageContent);

    return { metadata, content };
  }
}
