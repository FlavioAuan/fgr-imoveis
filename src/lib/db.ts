import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fgr_imoveis",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  timezone: "-03:00",
});

export default pool;

export type QueryParam = string | number | boolean | null | undefined;

export async function query<T = unknown>(
  sql: string,
  params?: QueryParam[]
): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await pool.execute(sql, params as any);
  return rows as T[];
}

export async function queryOne<T = unknown>(
  sql: string,
  params?: QueryParam[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
