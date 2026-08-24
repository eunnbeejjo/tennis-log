/**
 * Next.js middleware는 Edge Runtime에서 실행되어 Node의 `crypto` 모듈을
 * 쓸 수 없습니다. 그래서 여기서는 Web Crypto API(SubtleCrypto)로
 * 동일한 HMAC-SHA256 서명을 검증합니다. (lib/auth.ts에서 Node crypto로
 * 만든 서명과 알고리즘이 같아서 문제없이 호환됩니다.)
 */

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30일, lib/auth.ts와 동일하게 유지

export async function isValidSessionEdge(
  cookieValue: string | undefined,
  secret: string
): Promise<boolean> {
  if (!cookieValue) return false;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return false;

  const expectedSig = await hmacSha256Hex(payload, secret);
  if (sig !== expectedSig) return false;

  const issuedAt = Number(payload);
  const ageSec = (Date.now() - issuedAt) / 1000;
  return ageSec < SESSION_MAX_AGE_SEC;
}
