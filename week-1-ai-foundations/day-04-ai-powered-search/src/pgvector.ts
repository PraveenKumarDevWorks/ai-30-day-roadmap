// pgvector accepts vectors written as text in the form "[0.1,0.2,0.3]".
// Ollama gives us a plain JS number array — this just formats it into that
// text form so it can be passed as a query parameter and cast with
// `::vector` on the Postgres side. See documents.service.ts and
// search.service.ts for where this gets used.
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}
