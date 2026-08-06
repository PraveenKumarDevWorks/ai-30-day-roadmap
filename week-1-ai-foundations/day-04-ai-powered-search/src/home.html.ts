// A single inline HTML page — no separate frontend framework for this day.
// It talks to the same API a real frontend would, using plain fetch().
export const HOME_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Day 4 — AI Powered Search</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; background:#0a0a0a; color:#eee; padding: 0 16px; }
  input, button, textarea { font-size: 14px; padding: 8px; border-radius: 6px; border: 1px solid #333; background:#111; color:#eee; font-family: inherit; }
  button { cursor:pointer; background:#2563eb; border:none; }
  .result { border:1px solid #333; border-radius:8px; padding:10px; margin-top:10px; }
  .score { color:#888; font-size:12px; margin-top:4px; }
  .row { display:flex; gap:6px; margin-bottom:10px; }
  h1 { font-size:18px; }
  h2 { font-size:14px; color:#aaa; margin-top:30px; }
  p.hint { color:#888; font-size:13px; }
</style>
</head>
<body>
  <h1>Day 4 — AI Powered Search</h1>
  <p class="hint">Type a search below. It finds documents by MEANING, not just matching words.</p>

  <div class="row">
    <input id="q" placeholder="e.g. how do I get my money back" style="flex:1" />
    <button onclick="doSearch()">Search</button>
  </div>
  <div id="results"></div>

  <h2>No documents yet? Load sample data</h2>
  <button onclick="seed()">Seed sample documents</button>
  <span id="seedStatus" style="margin-left:10px; color:#888; font-size:13px;"></span>

  <h2>Add your own document</h2>
  <div class="row">
    <textarea id="newDoc" style="flex:1" rows="2" placeholder="Type a sentence to add to the search index"></textarea>
    <button onclick="addDoc()">Add</button>
  </div>

<script>
async function doSearch() {
  const q = document.getElementById('q').value
  const res = await fetch('/search?q=' + encodeURIComponent(q))
  const data = await res.json()
  const el = document.getElementById('results')
  el.innerHTML = data.map(function (r) {
    return '<div class="result"><div>' + r.content + '</div>' +
      '<div class="score">similarity: ' + r.similarity.toFixed(3) + '</div></div>'
  }).join('') || '<p class="hint">No results. Try seeding sample documents first.</p>'
}

async function seed() {
  document.getElementById('seedStatus').textContent = 'seeding…'
  const res = await fetch('/documents/seed', { method: 'POST' })
  const data = await res.json()
  document.getElementById('seedStatus').textContent = 'added ' + data.length + ' documents'
}

async function addDoc() {
  const content = document.getElementById('newDoc').value
  if (!content.trim()) return
  await fetch('/documents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content }),
  })
  document.getElementById('newDoc').value = ''
  alert('Added!')
}
</script>
</body>
</html>
`
