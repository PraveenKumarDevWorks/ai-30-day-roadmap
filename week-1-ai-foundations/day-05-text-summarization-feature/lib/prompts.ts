export type SummaryMode = 'extractive' | 'abstractive'

// The "map" step: summarize ONE chunk on its own, with no knowledge of the
// other chunks. Extractive and abstractive get genuinely different
// instructions, not just a wording tweak — they ask the model to do
// different things.
export function buildMapPrompt(mode: SummaryMode, chunk: string): string {
  if (mode === 'extractive') {
    return (
      'From the text below, pick out the 2-4 most important sentences, ' +
      'copied EXACTLY as written — do not rephrase or add anything new. ' +
      'Return each one on its own line, starting with "- ".\n\n' +
      `Text:\n${chunk}`
    )
  }
  return (
    'Summarize the text below in your own words, as 2-4 short bullet points ' +
    'capturing only the key points. Return each one on its own line, ' +
    'starting with "- ".\n\n' +
    `Text:\n${chunk}`
  )
}

// The "reduce" step: combine several already-summarized chunks into one
// final summary. Only used when there was more than one chunk.
export function buildReducePrompt(mode: SummaryMode, chunkSummaries: string[]): string {
  const combined = chunkSummaries.map((s, i) => `Part ${i + 1}:\n${s}`).join('\n\n')

  if (mode === 'extractive') {
    return (
      'Below are important sentences pulled from different parts of a longer document. ' +
      'Combine them into one final list of the 4-6 most important points overall. ' +
      'Keep the original wording where possible — do not invent new sentences. ' +
      'Return each point on its own line, starting with "- ".\n\n' +
      combined
    )
  }
  return (
    'Below are summaries of different parts of a longer document. Combine them into ' +
    'one final, coherent summary of 4-6 bullet points, removing anything repeated. ' +
    'Return each point on its own line, starting with "- ".\n\n' +
    combined
  )
}
