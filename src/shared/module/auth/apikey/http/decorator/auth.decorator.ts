import { applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

export function AuthDecorator() {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'APIKEY informada não é válida.',
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Unauthorized' },
          message: { type: 'string', example: 'Missing API Key' },
          statusCode: { type: 'number', example: 401 },
        },
      },
    }),
  );
}
