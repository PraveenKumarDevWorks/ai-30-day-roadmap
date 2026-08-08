import { IsString, MinLength } from 'class-validator'

export class AddDocumentDto {
  @IsString()
  @MinLength(1)
  source: string

  @IsString()
  @MinLength(1)
  content: string
}
