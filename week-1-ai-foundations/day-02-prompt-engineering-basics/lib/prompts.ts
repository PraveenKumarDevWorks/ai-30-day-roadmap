export type PromptMode = 'zero-shot' | 'few-shot' | 'chain-of-thought'

// A default task that's deliberately a little ambiguous — sentiment
// classification shows the differences between prompting styles clearly,
// because "how confident is the model, and does it follow the output format"
// is easy to see at a glance.
export const DEFAULT_TASK =
  'Review: "The pizza arrived cold and the delivery took over an hour, but the manager apologized and refunded us."'

// Turns one task into three differently-shaped prompts. The task text
// doesn't change — only how much guidance we wrap around it.
export function buildPrompt(mode: PromptMode, task: string): string {
  switch (mode) {
    case 'zero-shot':
      // No examples, no worked-through reasoning — just the instruction.
      // This is the cheapest prompt to write, but the model has to guess
      // both the right answer AND the format you want, from the instruction
      // alone.
      return `Classify the sentiment of this review as positive, negative, or neutral. Reply with a single word.\n\n${task}\n\nSentiment:`

    case 'few-shot':
      // Show a few worked examples before the real question. The model
      // isn't just told what to do — it's shown a pattern, and it's very
      // good at continuing a pattern it can see. This usually locks down
      // the output format (one word, lowercase, no extra sentences) far
      // more reliably than an instruction alone.
      return [
        'Classify the sentiment of each review as positive, negative, or neutral.',
        '',
        'Review: "Amazing ambiance and the staff went above and beyond."',
        'Sentiment: positive',
        '',
        'Review: "It was okay, nothing special but nothing bad either."',
        'Sentiment: neutral',
        '',
        'Review: "Waited 40 minutes and the order was still wrong."',
        'Sentiment: negative',
        '',
        `${task}`,
        'Sentiment:',
      ].join('\n')

    case 'chain-of-thought':
      // Ask the model to reason out loud before answering, instead of
      // jumping straight to a verdict. This tends to improve accuracy on
      // anything that benefits from weighing multiple points (like this
      // review, which has both a complaint AND a good resolution) — at the
      // cost of a longer, slower reply.
      return `${task}\n\nThink through the reasons step by step, weighing the good and bad points, then end your reply with exactly one line: "Sentiment: positive" or "Sentiment: negative" or "Sentiment: neutral".`
  }
}
