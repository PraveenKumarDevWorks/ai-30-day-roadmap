import { NextRequest } from 'next/server'
import { chunkText } from '@/lib/chunk'
import { buildMapPrompt, buildReducePrompt, SummaryMode } from '@/lib/prompts'
import { callOllama } from '@/lib/ollama'
import { fetchAndExtractText } from '@/lib/extractText'
import { parseBullets } from '@/lib/parseBullets'

export const runtime = 'nodejs'

type RequestBody = { text?: string; url?: string; mode?: SummaryMode }

export async function POST(req: NextRequest) {
  const { text, url, mode = 'abstractive' } = (await req.json()) as RequestBody

  const encoder = new TextEncoder()

  // This route streams its OWN small protocol — one JSON "event" per line,
  // NDJSON-style like earlier days, but describing PIPELINE STAGES
  // ("chunking", "chunk 2 of 3 done", "combining") instead of individual
  // AI-generated tokens. A multi-step pipeline like this doesn't have one
  // continuous stream of text to show — it has several separate steps, so
  // streaming progress between steps is what keeps the page feeling alive
  // instead of just staring at a spinner for a while.
  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      }

      try {
        let sourceText = text?.trim() ?? ''

        if (!sourceText && url) {
          emit({ stage: 'fetching-url' })
          sourceText = await fetchAndExtractText(url)
        }

        if (!sourceText || sourceText.length < 20) {
          emit({ stage: 'error', message: 'No text to summarize — paste more text or check the URL.' })
          controller.close()
          return
        }

        const chunks = chunkText(sourceText, 350)
        emit({ stage: 'chunking', totalChunks: chunks.length })

        // The "map" step: summarize every chunk on its own, one at a time.
        // Each call only ever sees its own chunk — never the whole
        // document — which is exactly why a chunk boundary landing in a
        // bad spot (e.g. splitting related ideas apart) can hurt quality.
        const chunkSummaries: string[] = []
        for (let i = 0; i < chunks.length; i++) {
          const prompt = buildMapPrompt(mode, chunks[i])
          const summary = await callOllama(prompt)
          chunkSummaries.push(summary)
          emit({ stage: 'chunk-summarized', index: i + 1, totalChunks: chunks.length })
        }

        let finalText: string
        if (chunks.length === 1) {
          // Only one chunk — its summary already IS the final summary.
          // There's nothing to combine, so the "reduce" step is skipped
          // entirely.
          finalText = chunkSummaries[0]
        } else {
          // The "reduce" step: combine every chunk's summary into one
          // final summary. This is a SEPARATE Ollama call that never sees
          // the original text — only the earlier summaries — which keeps
          // its input small no matter how long the original document was.
          emit({ stage: 'reducing' })
          const reducePrompt = buildReducePrompt(mode, chunkSummaries)
          finalText = await callOllama(reducePrompt)
        }

        const bullets = parseBullets(finalText)
        emit({ stage: 'done', bullets })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong.'
        emit({ stage: 'error', message })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
