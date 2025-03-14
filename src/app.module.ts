import { Module } from '@nestjs/common';
import { ConfigModule } from './shared/module/config/config.module';
import { AuthApiKeyModule } from './shared/module/auth/apikey/auth-apikey.module';
import { AuthApiKeyGuard } from './shared/module/auth/apikey/http/guard/auth-apikey.guard';
import { APP_GUARD } from '@nestjs/core';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthApiKeyModule, AgentModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthApiKeyGuard,
    },
  ],
})
export class AppModule {}
