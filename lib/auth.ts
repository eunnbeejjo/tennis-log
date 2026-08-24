import crypto from "crypto";

const SESSION_COOKIE = "tl_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30일

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/** PIN이 맞는지 확인 (해시 비교) */
export function verifyPin(pin: string): boolean {
  const expectedHash = process.env.APP_PIN_HASH;
  if (!expectedHash) return false;
  const inputHash = crypto.createHash("sha256").update(pin).digest("hex");
  return inputHash === expectedHash;
}

/** 로그인 성공 시 브라우저에 심을 세션 쿠키 값 생성 */
export function createSessionValue(): string {
  const secret = process.env.SESSION_SECRET || "dev-secret";
  const payload = String(Date.now());
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

/** 쿠키에 담긴 세션 값이 유효한지 확인 */
export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return false;

  const secret = process.env.SESSION_SECRET || "dev-secret";
  const expectedSig = sign(payload, secret);
  if (sig !== expectedSig) return false;

  const issuedAt = Number(payload);
  const ageSec = (Date.now() - issuedAt) / 1000;
  return ageSec < SESSION_MAX_AGE_SEC;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SEC;
