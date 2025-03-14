import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthApiKeyService } from './core/service/auth-apikey.service';
import { AuthApiKeyStrategy } from './core/strategy/auth-apikey.strategy';
import { ConfigService } from '../../config/config.service';

@Module({
  imports: [PassportModule],
  providers: [AuthApiKeyService, AuthApiKeyStrategy, ConfigService],
})
export class AuthApiKeyModule {}
