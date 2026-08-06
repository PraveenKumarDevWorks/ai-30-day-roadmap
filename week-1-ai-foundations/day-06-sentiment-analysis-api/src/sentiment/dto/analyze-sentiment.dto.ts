import { IsString, MinLength } from 'class-validator'

export class AnalyzeSentimentDto {
  @IsString()
  @MinLength(1)
  text: string
}
