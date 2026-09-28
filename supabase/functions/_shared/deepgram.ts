// Deepgram: speech-to-text (nova-3) and text-to-speech (Aura-2).

// Base URL override exists only for local end-to-end tests against a fake server.
const API = `${Deno.env.get('DEEPGRAM_API_BASE') ?? 'https://api.deepgram.com'}/v1`;
const STT_MODEL = () => Deno.env.get('DEEPGRAM_STT_MODEL') ?? 'nova-3';
// Aura-2 "Athena": calm, smooth — suits reading a reflective question.
const TTS_VOICE = () => Deno.env.get('DEEPGRAM_TTS_VOICE') ?? 'aura-2-athena-en';

function auth() {
  const key = Deno.env.get('DEEPGRAM_API_KEY');
  if (!key) throw new Error('DEEPGRAM_API_KEY is not set');
  return `Token ${key}`;
}

/** Pre-recorded transcription of raw audio bytes. */
export async function transcribeAudio(audio: ArrayBuffer, contentType: string): Promise<string> {
  const params = new URLSearchParams({
    model: STT_MODEL(),
    smart_format: 'true',
    punctuate: 'true',
    language: 'en',
  });
  const res = await fetch(`${API}/listen?${params}`, {
    method: 'POST',
    headers: { Authorization: auth(), 'Content-Type': contentType || 'audio/mp4' },
    body: audio,
  });
  if (!res.ok) throw new Error(`Deepgram STT ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  return (json?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? '').trim();
}

/** Speech for `text` as MP3 bytes. */
export async function speak(text: string): Promise<Uint8Array<ArrayBuffer>> {
  const params = new URLSearchParams({ model: TTS_VOICE(), encoding: 'mp3' });
  const res = await fetch(`${API}/speak?${params}`, {
    method: 'POST',
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Deepgram TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return new Uint8Array(await res.arrayBuffer());
}
