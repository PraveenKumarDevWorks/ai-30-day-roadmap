// The model is asked to reply with lines starting in "- ", but nothing
// forces it to obey perfectly. This cleans up whatever it actually sent —
// strips bullet/number markers, drops blank lines — instead of trusting
// the raw text as already-correct.
export function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*•]\s*/, '').replace(/^\d+[.)]\s*/, ''))
    .filter((line) => line.length > 0)
}
