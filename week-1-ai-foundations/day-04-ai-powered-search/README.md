# Day 4: AI-powered search

**Week 1 — AI Foundations — Text & APIs** · Category: Full Stack

## Status

- [x] Built (2026-08-06)

## Run it

```
docker compose up -d          # starts Postgres with the pgvector extension available
cp .env.example .env
npm install
npx prisma generate           # needs internet, downloads Prisma's local database engine
npm run db:enable-vector      # turns on the pgvector extension for this database
npx prisma db push            # creates the "documents" table, including the vector column
ollama pull nomic-embed-text  # only needed once
ollama serve                  # if it isn't already running as a background service
npm run start:dev
```

Open http://localhost:3001, click "Seed sample documents", then search for something like "how do I get my money back" — notice it finds the refund document even though the word "money" is nowhere in it.

---

## Explain it like I'm 10

Think about a librarian who has read every book in the library and remembers what each one is *about*, not just the words in the title.

If you ask "do you have a book about a kid who goes to a magic school," the librarian doesn't need you to say "Harry Potter." They understand what you mean, and point you to the right shelf — even though your words don't match the book's title at all.

That's what this project does with sentences instead of books.

1. Every sentence we store gets turned into a list of numbers by Ollama. This list of numbers is called an **embedding**. Think of it like a fingerprint for *meaning* — sentences with similar meaning get similar-looking fingerprints, even if they don't share any of the same words.
2. We save each sentence AND its fingerprint together in a database.
3. When you search, your search text ALSO gets turned into a fingerprint the same way.
4. The database compares your fingerprint to every stored fingerprint, and finds the ones that look most alike.
5. Those closest matches are your search results — found by meaning, not by matching exact words.

This is why searching "how do I get my money back" can find a sentence about refunds, even though the word "money" never appears in it. The two sentences *mean* similar things, so their fingerprints are close together.

## How it flows (diagram)

```mermaid
sequenceDiagram
    participant You as You (browser)
    participant API as NestJS API
    participant Ollama
    participant DB as Postgres (pgvector)

    Note over You,DB: Adding a document
    You->>API: POST /documents { content }
    API->>Ollama: turn content into a fingerprint (embedding)
    Ollama-->>API: [0.12, -0.08, 0.55, ...] (768 numbers)
    API->>DB: save content + fingerprint together

    Note over You,DB: Searching
    You->>API: GET /search?q=your question
    API->>Ollama: turn your question into a fingerprint too
    Ollama-->>API: [0.10, -0.09, 0.51, ...]
    API->>DB: find the stored fingerprints closest to this one
    DB-->>API: closest matches, closest first
    API-->>You: matching sentences + how close each one is
```

---

## Backend flow: how one request actually travels

This section is for the backend side specifically — a plain, step-by-step trace of what happens, in order, from the moment a request leaves the browser to the moment an answer comes back. No skipped steps.

**A few words first, since these come up constantly:**

- **HTTP request** — a message the browser (or any program) sends to a server. It has a method (GET, POST, ...), a URL, and sometimes a body (data attached, usually JSON).
- **Server** — a program that sits and waits for HTTP requests, and sends back a response for each one. Here, that's our NestJS app, running on port 3001.
- **Route** — one specific address the server understands, like `POST /documents`. The server keeps a list of these and picks the right one based on the method and URL of each incoming request.
- **Decorator** — the `@Controller()`, `@Post()`, `@Get()` labels above our class and method names. NestJS reads these once, when the app starts, to build its internal map of "which URL goes to which function." They are not run like normal step-by-step code.

### Why Docker, why Prisma, and how they connect

This is the first project in the roadmap with a real database, so it's worth being clear about what these two new tools are actually doing, before tracing requests through them.

**Why Docker?**

Postgres is not something that lives inside our Node.js app — it's a completely separate program that needs to be installed and running on its own, listening for connections. Installing a database directly on your own computer is messy: different versions clash with each other, uninstalling leaves files behind, and getting the pgvector extension working on top of a manually-installed Postgres usually means compiling things from source.

Docker solves this by packaging a full, working copy of Postgres — with pgvector already built in — into something called a **container**: a small, isolated, pre-configured environment that runs exactly the same way on any computer. `docker-compose.yml` is the recipe for that container: which image to use (`pgvector/pgvector:pg16`), which port to expose (5432), and which username/password/database name to set up automatically the first time it starts. Running `docker compose up -d` starts it in seconds. Running `docker compose down` removes it completely — nothing else gets left behind on your machine, unlike a manual install.

**Why Prisma?**

Our NestJS code needs to talk to Postgres somehow. Without a tool like Prisma, that means writing raw SQL strings by hand everywhere, manually opening and closing database connections, manually converting between JavaScript values and SQL types, and manually being careful about SQL injection every single time. Prisma sits between our code and the database and handles all of that: it manages the connection for us, and — normally — generates matching TypeScript types from our schema so we get autocomplete and compile-time errors if we misspell a column name.

`prisma/schema.prisma` is where the `documents` table is described once. From that one file, Prisma can create the real table in Postgres (`npx prisma db push`) and generate a matching TypeScript client library (`npx prisma generate`) that our code imports. The one exception, as covered above, is the `embedding` column — since Prisma has no native vector type, that one column falls back to raw SQL. Everything else about Prisma (connection handling, safe parameter binding, the generated client) still applies normally.

**How the whole chain actually connects, in order:**

1. `docker compose up -d` starts a real Postgres server process, running inside a container, reachable at `localhost:5432` on your own machine (the `ports: - '5432:5432'` line in `docker-compose.yml` is what makes the container's internal port reachable from outside it).
2. `.env`'s `DATABASE_URL` is Prisma's "address book entry" for that server: `postgresql://postgres:postgres@localhost:5432/day4_search` says the protocol, username, password, host, port, and database name, all in one string.
3. `npx prisma generate` reads `prisma/schema.prisma` and writes a matching client library into `node_modules/@prisma/client`. This step never touches the database at all — it's pure code generation from the schema file sitting on disk.
4. When the NestJS app actually starts, `PrismaService` (which extends the generated `PrismaClient`) calls `this.$connect()` inside `onModuleInit()`. **This is the exact moment a real network connection to Postgres gets opened**, using the `DATABASE_URL` from step 2.
5. From then on, every `$queryRaw` call anywhere in our services reuses that same connection (Prisma manages a small pool of them) to send SQL to Postgres inside the Docker container, and get rows back.
6. When the app shuts down, `onModuleDestroy()` calls `this.$disconnect()`, closing the connection cleanly.

So the full chain is: **Docker runs Postgres → `DATABASE_URL` tells Prisma where to find it → `prisma generate` builds the client code → `PrismaService` opens the actual connection on startup → our services' `$queryRaw` calls travel over that connection → Postgres (still just a program sitting inside the Docker container) does the real work and sends rows back.**

### Flow A: adding a document — `POST /documents`

1. **The browser sends the request.** The HTML page's `addDoc()` function calls `fetch('/documents', { method: 'POST', body: JSON.stringify({ content }) })`. This leaves the browser as one HTTP request.

2. **NestJS's router finds the matching function.** When the app started (`src/main.ts` ran `NestFactory.create(AppModule)`), Nest had already scanned every controller and built a table of "method + URL → function." It sees `POST /documents` and matches it to `DocumentsController.create()`, because that class has `@Controller('documents')` and that method has `@Post()`.

3. **The ValidationPipe checks the data BEFORE our code runs.** `main.ts` registered `app.useGlobalPipes(new ValidationPipe(...))` for the whole app. Nest runs this on every request that expects a DTO, before the controller method is called. It checks the incoming JSON against `CreateDocumentDto` — content must be a string, at least 3 characters. If it fails, the request is rejected right here, and `DocumentsController.create()` never runs at all. This is why the controller doesn't need its own "is this valid?" check — that job is already finished by the time it's called.

4. **The controller runs — and does almost nothing on purpose.** `DocumentsController.create(dto)` just calls `this.documentsService.create(dto.content)` and returns whatever comes back. A controller's only job is "receive the request, hand it off." Keeping it this thin means the real logic lives in exactly one place (the service), not copied into every route that might need it.

5. **The service starts the real work — by calling a completely different program.** `DocumentsService.create()` calls `this.ollama.embed(content)`. This sends a second, separate HTTP request — this time our NestJS server is the sender, and Ollama (a different program, listening on port 11434) is the receiver. `await` here means: pause this function right where it is, and don't continue until Ollama's answer comes back.

6. **Ollama replies with a list of numbers.** `OllamaService.embed()` reads the `embedding` field out of Ollama's JSON response and returns it as a plain array of 768 numbers.

7. **The array gets turned into text pgvector understands.** `toVectorLiteral(embedding)` turns `[0.1, 0.2, ...]` into the string `"[0.1,0.2,...]"`. No network involved — just formatting.

8. **The service sends a THIRD request — this time to the database.** `this.prisma.$queryRaw` sends an `INSERT ... RETURNING` SQL statement to Postgres (yet another separate program, listening on port 5432). Postgres creates the row and sends back its new `id` and `content`.

9. **The result travels back up, unchanged, through every layer it came from.** Postgres → Prisma → `DocumentsService.create()` returns it → `DocumentsController.create()` returns it → Nest turns it into JSON automatically → sent back as the HTTP response → the browser's `fetch()` call resolves with it.

Three separate programs took part in this one request — NestJS, Ollama, and Postgres — each one waiting for the previous step to finish before doing its part. That whole chain is "the backend" for this one feature.

### Flow B: searching — `GET /search?q=...`

Same idea, slightly different shape:

1. Browser calls `fetch('/search?q=' + encodeURIComponent(q))` — a GET request, so there's no body. The search text travels inside the URL itself, as a query parameter.
2. Nest's router matches this to `SearchController.search()`, and `@Query('q')` pulls the `q` value straight out of the URL.
3. There's no DTO here, so no ValidationPipe step. Instead the controller checks it by hand: `if (!q) throw new BadRequestException(...)` — a single query parameter is simple enough not to need a whole DTO class.
4. `SearchController.search()` calls `SearchService.search(q, limit)`.
5. `SearchService` calls `OllamaService.embed(q)` — the exact same embedding call as Flow A, just on the search text instead of a document.
6. `SearchService` runs `SELECT ... ORDER BY embedding <=> ... LIMIT ...` as one raw query. Postgres compares the new vector against every stored row and hands back only the closest matches, already sorted, in a single trip.
7. The service turns each row's `distance` into `similarity` and returns the array.
8. That array flows back up through the controller, becomes the JSON response, and the HTML page's `doSearch()` function draws it on screen.

### Why bother with all these separate layers?

- If `DocumentsController` talked to Ollama and Postgres directly itself, that same code would need to be copied into every other route that ever needed to add a document. The service exists so that logic lives in exactly one place.
- If validation happened inside the service instead, every single service method would need its own hand-written validation. The ValidationPipe does it once, automatically, for every route that declares a DTO.
- Because NestJS, Ollama, and Postgres are three separate programs talking over HTTP and SQL — not one giant program — any one of them can be swapped out without touching the others. Swap Ollama for OpenAI, or Postgres for a different database, and the rest of this chain barely notices.

---

## If someone wakes you up at midnight and quizzes you

**Q: What is an embedding, in one line?**
A: A list of numbers that represents the meaning of a piece of text. Text with similar meaning gets a similar list of numbers.

**Q: Why does similar meaning give a similar list of numbers?**
A: The embedding model was trained on huge amounts of text, and learned to place similar ideas near each other in this "number space." It's not a rule someone wrote by hand — the model learned it from examples.

**Q: What is cosine similarity, and how is it different from Euclidean distance?**
A: Cosine similarity looks at the *angle* between two number-lists (vectors), ignoring their size — it answers "do these two point in the same direction?" Euclidean distance looks at the actual straight-line gap between two points, which cares about size too. For text embeddings, direction usually matters more than size, so cosine similarity (or the closely related cosine distance) is the more common choice — that's what this project uses.

**Q: What is pgvector?**
A: A free add-on (extension) for PostgreSQL that adds a new column type called `vector`, plus fast ways to search "which stored vectors are closest to this one." Without it, Postgres has no built-in idea of what a vector search even means.

**Q: Why does the Prisma schema use `Unsupported("vector(768)")` instead of a normal type?**
A: Because Prisma doesn't have a built-in vector type. `Unsupported(...)` tells Prisma "create the column with exactly this raw SQL type, but don't try to build type-safe read/write helpers for it." That's why every query touching the `embedding` column in this project is written as raw SQL with `$queryRaw`, not the usual `prisma.document.findMany()` style.

**Q: What are ivfflat and hnsw?**
A: Two different kinds of index pgvector can build to make similarity search fast on large datasets. `ivfflat` groups vectors into rough clusters and only searches the closest clusters — fast to build, slightly less accurate. `hnsw` builds a layered graph of connections between vectors — usually more accurate and faster to search, but slower and more memory-heavy to build. This project skips both, since a handful of demo rows don't need an index at all — a full scan over 8 rows is already instant. You'd add one once you have thousands or millions of rows.

**Q: Why do you need the SAME embedding model for both storing and searching?**
A: Each embedding model has its own private "number space" — it decides on its own what each number means. Comparing a vector from one model to a vector from a different model is like comparing a fingerprint to a shoe print — they're not the same kind of measurement, so the comparison means nothing.

**Q: What is a NestJS module, controller, and service, in one line each?**
A: A **controller** handles incoming HTTP requests and decides which function should answer them. A **service** holds the actual logic (talking to the database, calling Ollama). A **module** is a box that groups a feature's controllers and services together and says how they connect to the rest of the app.

**Q: Why does `/api/embeddings` not need streaming, unlike the chat/generate endpoints from earlier days?**
A: An embedding is a single, complete, fixed-size answer — a list of 768 numbers, done in one shot. There's no "typing it out word by word" concept for a list of numbers, so Ollama just returns the whole thing as one normal JSON response.

---

## What to build

Build semantic search using embeddings from a local Ollama embedding model (e.g. nomic-embed-text). Store vectors in PostgreSQL with pgvector. Query by similarity. This is the foundation of most AI search products.

## Deep-dive topics

- What an embedding actually is (a vector that encodes meaning) and why similar meaning = similar vector
- Cosine similarity vs Euclidean distance for vector search
- Setting up the pgvector extension in PostgreSQL and defining a vector column
- ivfflat vs hnsw indexes — trade-offs for small vs large datasets
- Running vector queries through Prisma (raw SQL, since Prisma has no native vector type yet)

## Stack for this project

NestJS, PostgreSQL, Prisma, pgvector, Ollama

## Deep dive: how it actually works (technical)

This is the first NestJS project in the roadmap, and the first one with a real database — so a bit more setup than earlier days, in exchange for a much more realistic backend shape.

**Project layout**

- `src/ollama/ollama.service.ts` — the only place that talks to Ollama's `/api/embeddings` endpoint. Plain, non-streaming JSON in, JSON out.
- `src/pgvector.ts` — one small helper, `toVectorLiteral()`, that turns a JS number array into the text format pgvector expects (`[0.1,0.2,0.3]`), so it can be passed as a query parameter and cast to `vector` on the Postgres side.
- `src/documents/*` — `POST /documents` (add one sentence) and `POST /documents/seed` (add the built-in sample sentences). Both go through `DocumentsService.create()`, which embeds the text, then inserts content + embedding together with one raw SQL `INSERT ... RETURNING`.
- `src/search/*` — `GET /search?q=...` embeds the query text, then runs a raw SQL `SELECT ... ORDER BY embedding <=> $vector LIMIT $n` to get the closest matches straight from the database, already sorted.
- `src/app.controller.ts` + `src/home.html.ts` — a single inline HTML page (no separate frontend project) with a search box, a "seed sample documents" button, and a form to add your own sentences. It's plain `fetch()` calls to the same API — nothing framework-specific.
- `prisma/schema.prisma` — defines the `documents` table shape, including the `Unsupported("vector(768)")` embedding column explained above.
- `scripts/enable-pgvector.ts` — a one-time script that runs `CREATE EXTENSION IF NOT EXISTS vector;`. This has to happen before `prisma db push` creates the table, and Prisma itself has no concept of "extensions," so it can never do this step automatically.

**Why raw SQL for the vector parts, and why that's actually fine**

Normally in a NestJS + Prisma project you'd write `prisma.document.findMany({ where: ... })` and get full type safety. That's not possible here for anything touching `embedding`, because it's an `Unsupported()` field. Instead, `$queryRaw` (a tagged template function on `PrismaService`, which every `PrismaClient` has regardless of your schema) is used directly. Values interpolated into a `$queryRaw` template are still safely parameter-bound by Prisma — it's not raw string concatenation, so there's no SQL injection risk from doing it this way.

**The actual similarity query, piece by piece**

```sql
SELECT id, content, (embedding <=> $1::vector) AS distance
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT $2
```

- `<=>` is pgvector's cosine distance operator. Smaller number = more similar.
- We sort by that distance directly in the database — Postgres does the comparison work across every row and hands back only the closest ones already in order. We never pull every row into Node.js and sort them ourselves, which would not scale.
- The API then converts distance to similarity (`1 - distance`) before sending it back, since "0.92 similarity" reads more naturally to a person than "0.08 distance."

**What tripped me up / worth knowing:**

- `prisma generate` needs internet access to download Prisma's local query engine binary the first time. This is normal for any fresh Prisma project — the sandbox this project was written in couldn't reach the download server, but a real developer machine can.
- `db push` was used here instead of `migrate dev`, on purpose — it's simpler for a fast local demo, since it skips the shadow-database step migrations normally use. For a real production project, `migrate dev` (which keeps a proper history of schema changes) is the better choice.
- Forgetting to run the `db:enable-vector` script before `db push` causes `db push` to fail, since Postgres doesn't know what the `vector` type even is until the extension is turned on.
- Port 3001 was picked on purpose, so this can run at the same time as the Next.js projects from earlier days (which default to port 3000) without a clash.
- **`prisma` (the CLI) and `@prisma/client` must stay on the same major version.** `package.json` had `prisma: ^7.9.1` alongside `@prisma/client: ^5.19.1` — Prisma 7 removed the `datasource { url = env(...) }` schema syntax in favor of `prisma.config.ts`, so the CLI rejected this Prisma-5-style schema with a confusing validation error. Fix was pinning `prisma` down to `^5.19.1` to match the client, not migrating the whole schema to the new config format.
- **`@prisma/client` does NOT auto-load `.env` outside the Prisma CLI.** `prisma generate` / `prisma db push` load it for you, but a plain script run through `ts-node` (like `scripts/enable-pgvector.ts`) does not — `new PrismaClient()` failed with "Environment variable not found: DATABASE_URL" even though `.env` existed. Fix: `npm install dotenv` and `import 'dotenv/config'` at the top of any standalone script that uses Prisma directly.
- **Port 5432 may already be taken by a native (non-Docker) Postgres install.** On macOS both a Homebrew/native `postgres` process and Docker's port-forwarder can end up bound to `localhost:5432` at the same time — connections silently land on the *native* Postgres instead of the container, so the container looks like it's running fine but the app can't find its database ("Database `day4_search` does not exist" even though it clearly does, inside the container). Check with `lsof -nP -iTCP:5432 -sTCP:LISTEN` before assuming the container is the problem. Fix here: remapped the container to host port **5433** in `docker-compose.yml` and `DATABASE_URL` (`.env` / `.env.example`) instead of touching the native Postgres, since other local projects depend on it.

---

## Using other AI models (just hints — not built here)

**A different local embedding model**

Ollama has other embedding models too (for example `mxbai-embed-large`). Pull it, change `OLLAMA_EMBED_MODEL` in `.env`, and update the `vector(768)` size in `schema.prisma` to match that model's actual output size (different models produce different-length vectors — `nomic-embed-text` happens to be 768 numbers long; another model might be 1024). If you change the size, you'd need to reset the table, since existing rows would have the wrong vector length.

**OpenAI embeddings**

OpenAI's `/v1/embeddings` endpoint works the same conceptual way — text in, one JSON response with a number array out — just a different URL, an `Authorization: Bearer` header, and a different output size (`text-embedding-3-small` is 1536 numbers, for example). The rest of this project — the pgvector column, the `<=>` search query, the whole NestJS structure — stays exactly the same, since none of it is Ollama-specific. Only `OllamaService.embed()` would change.

**Other vector databases (instead of pgvector)**

Postgres + pgvector was used here because you already have PostgreSQL in your stack, so it's one less new tool to learn. Dedicated vector databases exist too (Pinecone, Weaviate, Qdrant, Milvus) and are built specifically for very large-scale similarity search. The core idea — text to vector, store the vector, compare vectors — is identical everywhere; only the storage and query syntax changes.

The one thing worth remembering: **the "meaning as numbers" idea is universal.** Whichever embedding model or vector store you use later, this same pattern — embed on write, embed on read, compare vectors — is the foundation of it.
