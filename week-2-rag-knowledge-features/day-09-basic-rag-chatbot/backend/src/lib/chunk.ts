/**
 * Same idea as Day 8's chunker: fixed-size, word-count chunks that overlap
 * a bit with their neighbor, so a fact sitting on a chunk boundary still
 * shows up whole in at least one chunk. Smaller defaults here because the
 * sample documents in this project are short.
 */
export function chunkWithOverlap(
  text: string,
  chunkWords = 120,
  overlapWords = 20
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
