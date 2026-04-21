import { Pinecone } from "@pinecone-database/pinecone";

const pc = process.env.PINECONE_API_KEY
  ? new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  : null;

async function geminiEmbed(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: {
        parts: [{ text }],
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Gemini embedding error (${res.status}): ${errorBody}`);
  }

  const data = (await res.json()) as any;
  return data?.embedding?.values ?? null;
}

export async function retrieveContext(
  query: string,
  agentId: string,
  topK = 5,
): Promise<string> {
  if (!pc || !process.env.GEMINI_API_KEY) {
    if (!process.env.GEMINI_API_KEY)
      console.warn("[RAG] Gemini not initialized. Skipping context retrieval.");
    return "";
  }
  const index = pc.index(process.env.PINECONE_INDEX!);

  try {
    const vector = await geminiEmbed(query);
    if (!vector) return "";

    // Query Pinecone
    const results = await index.query({
      vector,
      topK,
      filter: { agentId },
      includeMetadata: true,
    });

    return results.matches
      .map((m) => (m.metadata as any)?.text || "")
      .filter(Boolean)
      .join("\n\n");
  } catch (err) {
    console.error("[RAG] Retrieval failed:", err);
    return "";
  }
}

export async function upsertDocuments(
  docs: { text: string; agentId: string }[],
) {
  if (!pc || !process.env.GEMINI_API_KEY) {
    console.warn("[RAG] Pinecone or Gemini not initialized. Skipping upsert.");
    return;
  }
  const index = pc.index(process.env.PINECONE_INDEX!);
  try {
    const vectors = await Promise.all(
      docs.map(async (doc, i) => {
        const embedding = await geminiEmbed(doc.text);
        return {
          id: `${doc.agentId}-${Date.now()}-${i}`,
          values: embedding ?? [],
          metadata: { text: doc.text, agentId: doc.agentId },
        };
      }),
    );
    await index.upsert(vectors as any);
  } catch (err) {
    console.error("[RAG] Upsert failed:", err);
  }
}
