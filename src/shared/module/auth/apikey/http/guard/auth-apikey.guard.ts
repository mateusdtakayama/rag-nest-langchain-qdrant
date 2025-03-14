import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorator/is-public.decorator';

@Injectable()
export class AuthApiKeyGuard extends AuthGuard('api-key') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException({
          name: 'Unauthorized',
          message: 'Missing API Key or Invalid API Key',
          statusCode: 401,
        })
      );
    }
    return user;
  }
}
