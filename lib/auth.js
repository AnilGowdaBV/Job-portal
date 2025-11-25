import { SignJWT, jwtVerify } from "jose";

const TOKEN_COOKIE = "token";

function getSecretKey() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export function getTokenCookieName() {
  return TOKEN_COOKIE;
}

export async function signAuthToken(payload, options = {}) {
  const secret = getSecretKey();
  const expiresIn = options.expiresIn ?? "7d";

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyAuthToken(token) {
  const secret = getSecretKey();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
