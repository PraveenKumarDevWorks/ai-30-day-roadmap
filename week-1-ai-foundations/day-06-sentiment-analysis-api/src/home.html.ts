// A tiny inline HTML tester, same idea as Day 4 — this project's real
// deliverable is the API, this page just makes it easy to try without
// needing curl. Analyze the same text twice in a row to see "cached: true"
// and a much faster response time on the second call.
export const HOME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Day 6 — Sentiment Analysis API</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; background:#0a0a0a; color:#eee; padding: 0 16px; }
  textarea, button { font-size: 14px; padding: 8px; border-radius: 6px; border: 1px solid #333; background:#111; color:#eee; font-family: inherit; }
  textarea { width: 100%; }
  button { cursor:pointer; background:#2563eb; border:none; margin-top: 8px; }
  pre { border:1px solid #333; border-radius:8px; padding:10px; margin-top:10px; white-space: pre-wrap; }
  h1 { font-size:18px; }
  p.hint { color:#888; font-size:13px; }
  .timing { color:#888; font-size:12px; margin-left: 8px; }
</style>
</head>
<body>
  <h1>Day 6 — Sentiment Analysis API</h1>
  <p class="hint">Type something, click Analyze, then click Analyze again on the EXACT same text — watch "cached" flip to true and the time drop.</p>

  <textarea id="text" rows="4" placeholder="Type a sentence or review..."></textarea>
  <br/>
  <button onclick="analyze()">Analyze</button>
  <span id="timing" class="timing"></span>
  <pre id="result"></pre>

<script>
async function analyze() {
  const text = document.getElementById('text').value
  if (!text.trim()) return
  const start = performance.now()
  const res = await fetch('/sentiment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text }),
  })
  const data = await res.json()
  const ms = Math.round(performance.now() - start)
  document.getElementById('timing').textContent = ms + 'ms'
  document.getElementById('result').textContent = JSON.stringify(data, null, 2)
}
</script>
</body>
</html>
`
