import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentService } from '../core/service/agent.service';
import { Body } from '@nestjs/common';
import { AuthDecorator } from '@src/shared/module/auth/apikey/http/decorator/auth.decorator';
import { AskQuestionRequestDto } from './dto/request/ask-question-request.dto';

@AuthDecorator()
@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @ApiOperation({ summary: 'Send a question to the agent' })
  @Post()
  async generateResponse(@Body() askQuestionRequestDto: AskQuestionRequestDto) {
    return this.agentService.generate(askQuestionRequestDto);
  }
}
