import { Injectable } from '@nestjs/common';
import { ConfigService } from '@src/shared/module/config/config.service';
@Injectable()
export class AuthApiKeyService {
  constructor(private readonly configService: ConfigService) {}
  validateApiKey(apiKey: string) {
    return this.configService.get('apiKey') === apiKey;
  }
}
