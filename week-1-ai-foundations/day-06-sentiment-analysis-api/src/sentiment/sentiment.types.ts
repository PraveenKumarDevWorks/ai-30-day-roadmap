export type SentimentLabel = 'positive' | 'negative' | 'neutral'

export interface SentimentResult {
  label: SentimentLabel
  score: number
}
