import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthApiKeyService } from '../service/auth-apikey.service';

@Injectable()
export class AuthApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly authApikeyService: AuthApiKeyService) {
    super(
      { header: 'x-api-key', prefix: '' },
      true,
      async (apiKey: string | null, done) => this.validate(apiKey, done),
    );
  }

  async validate(apiKey: string, done: (error: Error, data) => void) {
    const isValid = await this.authApikeyService.validateApiKey(apiKey);

    if (!isValid) {
      return done(null, false);
    }

    return done(null, true);
  }
}
