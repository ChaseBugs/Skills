// One-time bootstrap for this project's isolated local MySQL instance only.
import mysql from "mysql2/promise";
import { randomBytes } from "node:crypto";
import { writeFile, access } from "node:fs/promises";
try {
  await access(".env.local");
  throw new Error(
    ".env.local already exists; refusing to overwrite credentials.",
  );
} catch (e) {
  if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
}
const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: 3311,
  user: "root",
});
const password = randomBytes(24).toString("hex");
const rootPassword = randomBytes(32).toString("hex");
const seedPassword = randomBytes(18).toString("base64url");
await db.query(
  "CREATE DATABASE skills_mvp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
);
await db.query("CREATE USER 'skills_app'@'localhost' IDENTIFIED BY ?", [
  password,
]);
await db.query(
  "GRANT ALL PRIVILEGES ON skills_mvp.* TO 'skills_app'@'localhost'",
);
await db.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?", [rootPassword]);
await writeFile(
  ".env.local",
  `DATABASE_URL=mysql://skills_app:${password}@127.0.0.1:3311/skills_mvp\nAPP_URL=http://localhost:3100\nUPLOAD_DIR=./uploads\nCOOKIE_SECURE=false\nSEED_HR_EMAIL=hr@example.test\nSEED_PASSWORD=${seedPassword}\n`,
  { flag: "wx" },
);
await writeFile(".local/mysql-root.txt", rootPassword, { flag: "wx" });
await writeFile(
  ".local/demo-login.txt",
  `Local demo only\nHR: hr@example.test\nPassword: ${seedPassword}\n`,
  { flag: "wx" },
);
await db.end();
console.log(
  "Isolated local database configured. Credentials saved in ignored local files.",
);
