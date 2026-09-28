import * as ExpoCrypto from 'expo-crypto';

// Hermes has no WebCrypto. Supabase Auth's PKCE needs `crypto.getRandomValues` (code
// verifier) and `crypto.subtle.digest('SHA-256')` (code challenge); without them it falls
// back to Math.random and the weaker "plain" method. expo-crypto provides both natively.
const g = globalThis as { crypto?: Partial<Crypto> };
const current = g.crypto ?? {};

if (!current.getRandomValues || !current.subtle) {
  g.crypto = {
    ...current,
    getRandomValues: current.getRandomValues ?? ExpoCrypto.getRandomValues,
    subtle:
      current.subtle ??
      ({
        digest: (algorithm: AlgorithmIdentifier, data: BufferSource) => {
          const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
          if (name.toUpperCase() !== 'SHA-256') throw new Error(`Unsupported digest: ${name}`);
          return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
        },
      } as unknown as SubtleCrypto),
  } as Crypto;
}
