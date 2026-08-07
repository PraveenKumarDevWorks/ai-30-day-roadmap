/**
 * Splits text into fixed-size, word-count chunks that OVERLAP each other.
 *
 * Day 5's chunker split at paragraph/sentence breaks and did NOT overlap —
 * good for summarizing, where each chunk should be a clean, separate idea.
 *
 * This chunker is different on purpose: for search/RAG, if a fact sits
 * right on a chunk boundary, a non-overlapping split can cut it in half
 * and neither chunk answers the question well. Overlap means each chunk
 * repeats a bit of the previous one, so boundary facts survive in at
 * least one whole chunk.
 */
export function chunkWithOverlap(
  text: string,
  chunkWords = 200,
  overlapWords = 40
): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const step = Math.max(chunkWords - overlapWords, 1)
  const chunks: string[] = []

  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(start + chunkWords, words.length)
    chunks.push(words.slice(start, end).join(' '))
    if (end === words.length) break
  }

  return chunks
}
