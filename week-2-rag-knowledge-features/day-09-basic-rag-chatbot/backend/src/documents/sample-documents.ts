// A handful of short sample documents so /documents/seed gives you something
// to ask questions about right away, without needing your own files.
export const SAMPLE_DOCUMENTS: { source: string; content: string }[] = [
  {
    source: 'ollama-basics.txt',
    content:
      'Ollama is a tool that runs large language models on your own computer, instead of calling a ' +
      'hosted API over the internet. You install it, then pull a model such as llama3.2 or ' +
      'nomic-embed-text, and it starts a local server at http://localhost:11434. Ollama exposes a ' +
      'REST API with endpoints like /api/chat for conversations, /api/generate for single prompts, ' +
      'and /api/embeddings for turning text into vectors. Because everything runs locally, there is ' +
      'no per-request cost and no data leaves your machine.',
  },
  {
    source: 'pgvector-basics.txt',
    content:
      'pgvector is a PostgreSQL extension that adds a new column type called vector, which stores a ' +
      'list of numbers representing an embedding. Once vectors are stored, pgvector lets you search ' +
      'for the most similar rows using distance operators such as <=> for cosine distance. This is ' +
      'the core building block behind semantic search and RAG systems: you embed a query, then ask ' +
      'the database to find the stored chunks whose vectors are closest to the query vector.',
  },
  {
    source: 'rag-basics.txt',
    content:
      'RAG stands for Retrieval-Augmented Generation. Instead of relying only on what a language ' +
      'model memorized during training, a RAG system first retrieves relevant text from your own ' +
      'documents, then includes that text as context in the prompt before asking the model to ' +
      'answer. The steps are: embed the user question, search a vector database for the top-k most ' +
      'similar chunks, insert those chunks into the prompt, and instruct the model to answer using ' +
      'only that context. This lets the model answer questions about documents it never saw during ' +
      'training, and reduces made-up answers because the model is grounded in retrieved text.',
  },
  {
    source: 'chunking-basics.txt',
    content:
      'Chunking is the process of splitting a long document into smaller pieces before embedding it. ' +
      'Embedding models work best on focused pieces of text rather than entire documents, and search ' +
      'results are more useful when they point to a specific paragraph instead of a whole file. A ' +
      'common technique is fixed-size chunking with overlap, where each chunk repeats a small amount ' +
      'of text from the chunk before it, so that a fact sitting right on a chunk boundary still ' +
      'appears whole in at least one chunk.',
  },
]
