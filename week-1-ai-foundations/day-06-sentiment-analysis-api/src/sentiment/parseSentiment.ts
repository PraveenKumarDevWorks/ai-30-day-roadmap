import { SentimentLabel, SentimentResult } from './sentiment.types'

const VALID_LABELS: SentimentLabel[] = ['positive', 'negative', 'neutral']

// Even with Ollama's format: "json" turned on (which guarantees the reply
// is SYNTACTICALLY valid JSON), nothing guarantees it's the SHAPE we asked
// for. The model could still use the wrong field names, return a label
// outside our three allowed values, or send score as a string instead of a
// number. This function trusts nothing it receives and fixes what it
// safely can, instead of assuming the model followed instructions exactly.
export function parseSentiment(raw: string): SentimentResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    // Fallback: the model may have wrapped the JSON in extra text (a
    // markdown code fence, an explanation sentence) despite format: "json".
    // Pull out the first {...} block and try parsing just that.
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error(`Could not find any JSON in the model's reply: ${raw}`)
    }
    parsed = JSON.parse(match[0])
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Model reply was not a JSON object.')
  }

  const obj = parsed as Record<string, unknown>

  const rawLabel = String(obj.label ?? '').toLowerCase().trim()
  const rawScore = Number(obj.score)
  const score = Number.isFinite(rawScore) ? clamp(rawScore, -1, 1) : 0

  const label: SentimentLabel = VALID_LABELS.includes(rawLabel as SentimentLabel)
    ? (rawLabel as SentimentLabel)
    : deriveLabelFromScore(score)

  return { label, score }
}

// Last-resort fallback if the label field is missing or not one of our
// three values — guess from the score instead of just failing outright.
function deriveLabelFromScore(score: number): SentimentLabel {
  if (score > 0.15) return 'positive'
  if (score < -0.15) return 'negative'
  return 'neutral'
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
