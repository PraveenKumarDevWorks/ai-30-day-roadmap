/**
 * Runs `fn` over `items` with at most `limit` calls in flight at once.
 *
 * Why this exists: embedding 40 chunks one at a time is slow (each call
 * waits for the last to finish). Firing all 40 at once can overload a
 * local Ollama server. This is a small "worker pool" — a fixed number of
 * workers keep pulling the next item off the list until the list is empty.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex++
      results[current] = await fn(items[current], current)
    }
  }

  const workerCount = Math.min(limit, items.length)
  const workers = Array.from({ length: workerCount }, () => worker())
  await Promise.all(workers)

  return results
}
