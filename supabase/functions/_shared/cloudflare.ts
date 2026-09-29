// Cloudflare Workers AI over its REST API: the dream artwork (FLUX.1 schnell) and the
// Kindred embeddings (bge-base-en-v1.5, 768 dims). Needs CLOUDFLARE_ACCOUNT_ID and a
// CLOUDFLARE_API_TOKEN with "Workers AI" permission. Model ids are secrets with defaults.

const IMAGE_MODEL = () => Deno.env.get('CLOUDFLARE_IMAGE_MODEL') ?? '@cf/black-forest-labs/flux-1-schnell';
// Kindred's SQL scoring is calibrated for this model (see the kindred migrations): change both together.
const EMBED_MODEL = () => Deno.env.get('CLOUDFLARE_EMBED_MODEL') ?? '@cf/baai/bge-base-en-v1.5';
export const EMBED_DIMS = 768;

function env(name: string) {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

async function run(model: string, input: unknown) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${env('CLOUDFLARE_ACCOUNT_ID')}/ai/run/${model}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${env('CLOUDFLARE_API_TOKEN')}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Cloudflare ${model} ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  if (json?.success === false) throw new Error(`Cloudflare ${model}: ${JSON.stringify(json.errors).slice(0, 300)}`);
  return json?.result;
}

/** A square JPEG from a text prompt. */
export async function paint(prompt: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const model = IMAGE_MODEL();
  const result = await run(model, {
    prompt: prompt.slice(0, 2048),
    steps: 8, // the model's maximum: best detail, still a few seconds
    // No `seed`: the docs list it, but the API rejects it ("Additional properties '/seed'").
  });
  const data: string | undefined = result?.image;
  if (!data) throw new Error(`Cloudflare ${model}: no image`);
  return { bytes: Uint8Array.from(atob(data), (c) => c.charCodeAt(0)), mimeType: 'image/jpeg' };
}

/** Embedding for similarity search (cosine), 768 dims. CLS pooling, as BGE is trained for. */
export async function embed(text: string): Promise<number[]> {
  const model = EMBED_MODEL();
  const result = await run(model, { text: [text], pooling: 'cls' });
  const values: number[] | undefined = result?.data?.[0];
  if (values?.length !== EMBED_DIMS) throw new Error(`Cloudflare ${model}: unexpected embedding`);
  return values;
}
