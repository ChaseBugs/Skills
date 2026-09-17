import { randomUUID } from "node:crypto";
import { execute, rows, pool } from "../lib/db";
import { passwordHash, secret } from "../lib/auth";
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 16 || password.includes("REPLACE_"))
  throw new Error(
    "Set SEED_PASSWORD to a random password of at least 16 characters.",
  );
if ((await rows("SELECT id FROM companies LIMIT 1")).length) {
  console.log("Database already has companies. Seed skipped.");
  await pool().end();
  process.exit(0);
}
const hr = randomUUID();
await execute(
  "INSERT INTO users(id,name,email,password_hash) VALUES (?,?,?,?)",
  [
    hr,
    "Camille Laurent",
    process.env.SEED_HR_EMAIL || "hr@example.test",
    passwordHash(password),
  ],
);
const companyIds = [randomUUID(), randomUUID()];
for (let index = 0; index < companyIds.length; index++) {
  const company = companyIds[index];
  await execute("INSERT INTO companies(id,name) VALUES (?,?)", [
    company,
    index === 0 ? "Northstar Construction" : "Atelier Engineering",
  ]);
  await execute(
    "INSERT INTO memberships(user_id,company_id,role) VALUES (?,?,?)",
    [hr, company, "HR"],
  );
  const catalogue = [
    ["Working at height", "Safety"],
    ["First aid at work", "Safety"],
    ["Forklift operation", "Equipment"],
    ["Electrical authorization", "Technical"],
    ["Site induction", "Onboarding"],
    ["Scaffolding inspection", "Technical"],
  ];
  const skillIds: string[] = [];
  for (const [name, category] of catalogue) {
    const id = randomUUID();
    skillIds.push(id);
    await execute(
      "INSERT INTO competencies(id,company_id,name,category,description) VALUES (?,?,?,?,?)",
      [
        id,
        company,
        name,
        category,
        "Record supporting evidence and keep the validity period up to date.",
      ],
    );
  }
  const people =
    index === 0
      ? [
          [
            "Thomas Bernard",
            "Site supervisor",
            "Operations",
            "Riverside project",
          ],
          [
            "Emma Wilson",
            "Safety coordinator",
            "Health & safety",
            "Riverside project",
          ],
          ["Lucas Martin", "Electrician", "Electrical", "Central station"],
          ["Sophie Dubois", "Civil engineer", "Engineering", "Central station"],
          ["James Anderson", "Plant operator", "Operations", "North quarter"],
          ["Léa Moreau", "Site foreman", "Operations", "North quarter"],
          ["Oliver Clarke", "Scaffolder", "Construction", "Riverside project"],
          ["Chloé Petit", "Project engineer", "Engineering", "Central station"],
          ["Noah Taylor", "Crane operator", "Operations", "North quarter"],
          ["Alice Robert", "Welder", "Construction", "Riverside project"],
          ["Hugo Lambert", "Technician", "Electrical", "Central station"],
          [
            "Charlotte Evans",
            "Site coordinator",
            "Operations",
            "North quarter",
          ],
        ]
      : [
          ["Ethan Cooper", "Engineer", "Engineering", "Workshop A"],
          ["Mia Roux", "Technician", "Operations", "Workshop A"],
        ];
  const day = (offset: number) =>
    new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  for (let p = 0; p < people.length; p++) {
    const [name, job, department, site] = people[p];
    const id = randomUUID();
    await execute(
      "INSERT INTO employees(id,company_id,name,ssn,job_title,department,site,email,qr_token) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        id,
        company,
        name,
        `DEMO-${index + 1}-${String(p + 1).padStart(3, "0")}`,
        job,
        department,
        site,
        "",
        secret(),
      ],
    );
    for (let s = 0; s < skillIds.length; s++) {
      if ((p + s) % 5 === 0) continue;
      const expiry =
        (p + s) % 7 === 0
          ? day(-12)
          : (p + s) % 4 === 0
            ? day(18 + s)
            : s === 4
              ? null
              : day(120 + p * 12 + s * 10);
      await execute(
        "INSERT INTO qualifications(id,company_id,employee_id,competency_id,issuer,valid_from,expires_on,verification) VALUES (?,?,?,?,?,?,?,?)",
        [
          randomUUID(),
          company,
          id,
          skillIds[s],
          "Demo training provider",
          day(-240),
          expiry,
          (p + s) % 9 === 0 ? "PENDING" : "VERIFIED",
        ],
      );
    }
  }
  await execute(
    "INSERT INTO audit_events(id,company_id,user_id,action,subject) VALUES (?,?,?,?,?)",
    [
      randomUUID(),
      company,
      hr,
      "Demo workspace prepared",
      "Synthetic employees and qualifications",
    ],
  );
}
console.log(
  "Created two demo companies, one HR account. All employee records are synthetic.",
);
await pool().end();
