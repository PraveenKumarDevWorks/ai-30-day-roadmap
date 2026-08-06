// Splits text into pieces that should comfortably fit inside a local
// model's context window, along with room left over for the prompt
// instructions and the model's reply. Splits on paragraph breaks first, and
// falls back to splitting by sentence for any single paragraph that's too
// long on its own — so a chunk boundary never lands in the middle of a
// sentence.
export function chunkText(text: string, maxWordsPerChunk = 350): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let current: string[] = []
  let currentWords = 0

  function pushCurrent() {
    if (current.length > 0) {
      chunks.push(current.join('\n\n'))
      current = []
      currentWords = 0
    }
  }

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)

    if (words.length > maxWordsPerChunk) {
      // This one paragraph is already bigger than a whole chunk budget on
      // its own — split it by sentence instead.
      pushCurrent()
      const sentences = paragraph.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [paragraph]
      let sentenceChunk: string[] = []
      let sentenceWords = 0

      for (const sentence of sentences) {
        const sWords = sentence.split(/\s+/).filter(Boolean).length
        if (sentenceWords + sWords > maxWordsPerChunk && sentenceChunk.length > 0) {
          chunks.push(sentenceChunk.join(' ').trim())
          sentenceChunk = []
          sentenceWords = 0
        }
        sentenceChunk.push(sentence.trim())
        sentenceWords += sWords
      }
      if (sentenceChunk.length > 0) chunks.push(sentenceChunk.join(' ').trim())
      continue
    }

    if (currentWords + words.length > maxWordsPerChunk && current.length > 0) {
      pushCurrent()
    }
    current.push(paragraph)
    currentWords += words.length
  }
  pushCurrent()

  return chunks.length > 0 ? chunks : [text]
}
