import { IsString, MaxLength, MinLength } from 'class-validator'

export class ChatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000, {
    message: 'question is too long (max 1000 characters) — ask something shorter and more specific.',
  })
  question: string
}
