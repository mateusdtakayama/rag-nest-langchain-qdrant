import { Module } from '@nestjs/common';

import { ConfigModule } from '@src/shared/module/config/config.module';
import { AgentService } from './core/service/agent.service';
import { AgentController } from './http/agent.controller';
@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
