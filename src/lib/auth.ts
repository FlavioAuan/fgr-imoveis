import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { queryOne } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fgr_secret_fallback"
);

export interface JWTPayload {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "corretor";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("fgr_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(
  allowedRoles?: Array<"super_admin" | "admin" | "corretor">
): Promise<JWTPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (allowedRoles && !allowedRoles.includes(session.role))
    throw new Error("FORBIDDEN");
  return session;
}

export async function getUserById(id: number) {
  return queryOne<{
    id: number;
    name: string;
    email: string;
    role: string;
    active: number;
  }>("SELECT id,name,email,role,active FROM users WHERE id=? LIMIT 1", [id]);
}
