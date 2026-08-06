import { IsString, MinLength } from 'class-validator'

export class CreateDocumentDto {
  @IsString()
  @MinLength(3)
  content: string
}
