import mysql, {
  type RowDataPacket,
  type ResultSetHeader,
} from "mysql2/promise";
const globalDb = globalThis as unknown as { skillsPool?: mysql.Pool };
export function pool() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  return (globalDb.skillsPool ??= mysql.createPool({
    uri: process.env.DATABASE_URL,
    connectionLimit: 8,
    dateStrings: true,
    timezone: "Z",
    multipleStatements: false,
  }));
}
export async function rows<T>(
  sql: string,
  values: (string | number | boolean | null | Buffer)[] = [],
): Promise<T[]> {
  const [result] = await pool().execute<RowDataPacket[]>(sql, values);
  return result as T[];
}
export async function execute(
  sql: string,
  values: (string | number | boolean | null | Buffer)[] = [],
) {
  const [result] = await pool().execute<ResultSetHeader>(sql, values);
  return result;
}
