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

@Injectable()
export class AgentService {
  constructor() {}
  async generate(askQuestionRequestDto: AskQuestionRequestDto) {
    const ragData = await this.retrieve(askQuestionRequestDto.query);

    const llm = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0,
    });

    const template = `You are a chatbot that answers questions. Use the sources below to answer the questions. If a link is provided in the query, use the web tool to search for additional information from the link. -sources- Question:`;

    const tools = [new TavilySearchResults({ maxResults: 1 })];

    const sourcesFormatted = JSON.stringify(ragData.content, null, 2).replace(
      /[{}]/g,
      '',
    );

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', template.replace('-sources-', sourcesFormatted)],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const modelWithFunctions = llm.bind({
      functions: tools.map((tool) => convertToOpenAIFunction(tool)),
    });

    const runnableAgent = RunnableSequence.from([
      {
        input: (i: { input: string; steps: AgentStep[] }) => i.input,
        agent_scratchpad: (i: { input: string; steps: AgentStep[] }) =>
          formatToOpenAIFunctionMessages(i.steps),
      },
      prompt,
      modelWithFunctions,
      new OpenAIFunctionsAgentOutputParser(),
    ]);

    const executor = AgentExecutor.fromAgentAndTools({
      agent: runnableAgent,
      tools,
    });

    const result = await executor.invoke({
      input: askQuestionRequestDto.query,
    });

    return {
      answer: result.output,
      sources: ragData.metadata,
    };
  }

  async retrieve(query: string) {
    const embeddings = new OpenAIEmbeddings({
      model: 'text-embedding-ada-002',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_COLLECTION_NAME,
        apiKey: process.env.QDRANT_API_KEY,
        contentPayloadKey: 'page_content',
      },
    );

    const retriever = vectorStore.asRetriever({
      k: 3,
    });

    const result = await retriever.invoke(query);

    const metadata = result.map((doc) => ({
      title: doc.metadata.title,
      url: doc.metadata.url,
      date: doc.metadata.date,
    }));

    const content = result.map((doc) => doc.pageContent);

    return {
      metadata,
      content,
    };
  }
}
