import { IsString, MaxLength, MinLength } from 'class-validator'

export class AnalyzeSentimentDto {
  @IsString()
  @MinLength(1)
  // Day 7 polish: this was originally missing entirely — nothing stopped
  // someone from pasting a huge wall of text, silently blowing past
  // Ollama's context window (the same idea Day 5 handles with chunking).
  // Sentiment analysis doesn't really need chunking (a review's sentiment
  // rarely needs the WHOLE document, just a solid sample of it), so a
  // simple length cap with a clear error is enough here — see Day 5 if a
  // feature genuinely needs to process arbitrarily long text.
  @MaxLength(3000, {
    message:
      'text is too long for this endpoint (max 3000 characters) — sentiment analysis works fine on an excerpt; ' +
      'for full long documents, see the chunking approach in Day 5 instead.',
  })
  text: string
}
