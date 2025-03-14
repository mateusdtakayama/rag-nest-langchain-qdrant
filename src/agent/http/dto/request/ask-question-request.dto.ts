import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AskQuestionRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String, required: true })
  query: string;
}
