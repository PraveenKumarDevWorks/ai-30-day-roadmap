export async function fetchAndExtractText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Day5SummarizerBot/1.0)' },
  })

  if (!res.ok) {
    throw new Error(`Could not fetch that URL (${res.status}).`)
  }

  const html = await res.text()
  return stripHtml(html)
}

// A deliberately simple HTML-to-text step — good enough for a learning
// project, not good enough for production. Real summarizer products use a
// proper "readability" extraction library, because real web pages are full
// of navigation, ads, and footer text that this naive approach can't tell
// apart from the actual article body. Worth swapping out later.
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|br|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim()
}
