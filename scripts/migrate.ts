import { readFile } from "node:fs/promises";
import { pool, rows, execute } from "../lib/db";
await execute(
  "CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(100) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
);
for (const name of ["001_initial.sql", "002_hr_only.sql"]) {
  if (
    !(await rows("SELECT name FROM schema_migrations WHERE name=?", [name]))
      .length
  ) {
    const sql = await readFile(
      new URL("../migrations/" + name, import.meta.url),
      "utf8",
    );
    for (const statement of sql
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean))
      await execute(statement);
    await execute("INSERT INTO schema_migrations (name) VALUES (?)", [name]);
    console.log("Applied " + name);
  } else console.log("Schema is current");
}
await pool().end();
