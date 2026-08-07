import { IsString, MinLength } from 'class-validator'

export class ListChunksDto {
  @IsString()
  @MinLength(1)
  source: string
}
