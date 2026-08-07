export const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Day 8 — Document Ingestion Pipeline</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 16px; color: #1a1a1a; }
  h1 { font-size: 1.4rem; }
  fieldset { margin-bottom: 24px; padding: 16px; border-radius: 8px; }
  label { display: block; margin: 8px 0 4px; font-weight: 600; }
  input[type=text], textarea { width: 100%; padding: 8px; box-sizing: border-box; font-family: inherit; }
  textarea { height: 120px; }
  button { margin-top: 12px; padding: 8px 16px; cursor: pointer; }
  pre { background: #f4f4f4; padding: 12px; border-radius: 6px; white-space: pre-wrap; word-break: break-word; max-height: 300px; overflow-y: auto; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  td, th { border: 1px solid #ddd; padding: 6px 8px; font-size: 0.85rem; text-align: left; }
</style>
</head>
<body>
  <h1>Day 8 — Document Ingestion Pipeline</h1>
  <p>Upload a file (PDF or .txt) or paste text. It gets chunked, embedded with Ollama, and saved into Postgres + pgvector.</p>

  <fieldset>
    <legend>Ingest</legend>
    <form id="ingestForm">
      <label>Source name (used to find chunks later)</label>
      <input type="text" id="source" placeholder="e.g. my-notes.txt" />

      <label>Upload a file (optional)</label>
      <input type="file" id="file" />

      <label>...or paste text directly (optional)</label>
      <textarea id="text" placeholder="Paste text here if not uploading a file"></textarea>

      <button type="submit">Ingest</button>
    </form>
    <pre id="progress">Progress will show here...</pre>
  </fieldset>

  <fieldset>
    <legend>Look up chunks</legend>
    <form id="lookupForm">
      <label>Source name</label>
      <input type="text" id="lookupSource" placeholder="e.g. my-notes.txt" />
      <button type="submit">List chunks</button>
    </form>
    <div id="chunks"></div>
  </fieldset>

<script>
  const progressEl = document.getElementById('progress')
  const chunksEl = document.getElementById('chunks')

  document.getElementById('ingestForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    progressEl.textContent = ''

    const source = document.getElementById('source').value.trim()
    const fileInput = document.getElementById('file')
    const text = document.getElementById('text').value

    const formData = new FormData()
    if (source) formData.append('source', source)
    if (fileInput.files[0]) formData.append('file', fileInput.files[0])
    if (text) formData.append('text', text)

    const res = await fetch('/ingest', { method: 'POST', body: formData })
    if (!res.body) { progressEl.textContent = 'No response body (streaming not supported here).'; return }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        progressEl.textContent += line + '\\n'
        progressEl.scrollTop = progressEl.scrollHeight
      }
    }
  })

  document.getElementById('lookupForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const source = document.getElementById('lookupSource').value.trim()
    chunksEl.textContent = 'Loading...'
    const res = await fetch('/chunks?source=' + encodeURIComponent(source))
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      chunksEl.textContent = 'No chunks found for that source.'
      return
    }
    let html = '<table><tr><th>#</th><th>Content (preview)</th></tr>'
    for (const row of data) {
      const preview = row.content.length > 120 ? row.content.slice(0, 120) + '...' : row.content
      html += '<tr><td>' + row.chunkIndex + '</td><td>' + preview.replace(/</g, '&lt;') + '</td></tr>'
    }
    html += '</table>'
    chunksEl.innerHTML = html
  })
</script>
</body>
</html>`
