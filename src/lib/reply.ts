// Splits the agent's reply into at most three parts at sentence ends, so each part can be
// voiced in parallel and played back to back. The reply opens with a 2–5 word sentence, so
// the first sound waits only for those few words; later parts are ready before they're due.
// Keep in sync with supabase/functions/_shared/reply.ts (the `speak` function voices each part).
export const MAX_PARTS = 3;

export function splitReply(text: string): string[] {
  const parts: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    // A sentence ends at . ! ? followed by a space and a capital ("owl... you" doesn't split).
    if ((c === '.' || c === '!' || c === '?') && text[i + 1] === ' ' && /[A-Z]/.test(text[i + 2] ?? '')) {
      parts.push(text.slice(start, i + 1).trim());
      start = i + 2;
    }
  }
  parts.push(text.slice(start).trim());
  const clean = parts.filter(Boolean);
  return clean.length > MAX_PARTS
    ? [...clean.slice(0, MAX_PARTS - 1), clean.slice(MAX_PARTS - 1).join(' ')]
    : clean;
}
