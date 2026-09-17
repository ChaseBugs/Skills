import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { rows, execute, pool } from "../lib/db";
const base = process.env.APP_URL || "http://localhost:3100";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1050 },
});
const page = await context.newPage();
const errors: string[] = [];
const testId = "BROWSER-" + randomUUID().slice(0, 8);
page.on("pageerror", (e) => errors.push(e.message));
await mkdir(".local/screenshots", { recursive: true });
try {
  await page.goto(base + "/login");
  await page
    .getByLabel("Email address")
    .fill(process.env.SEED_HR_EMAIL || "hr@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.SEED_PASSWORD!);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Company workspace")
    .selectOption({ label: "Northstar Construction" });
  await expect(page.locator(".stat-number").first()).toHaveText("12");
  await page.screenshot({
    path: ".local/screenshots/overview-dark.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({
    path: ".local/screenshots/overview-light.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page
    .getByRole("link", { name: "Employees", exact: false })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Employees", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search employees", { exact: true }).fill("Thomas");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("link", { name: "Thomas Bernard" }).first().click();
  await expect(
    page.getByRole("heading", { name: "Employee profile" }),
  ).toBeVisible();
  await page.screenshot({
    path: ".local/screenshots/employee.png",
    fullPage: true,
  });
  const passportUrl = await page
    .getByRole("link", { name: /Public passport/ })
    .getAttribute("href");
  const [labelPage] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("link", { name: "Open print layout" }).click(),
  ]);
  await expect(
    labelPage.getByRole("heading", { name: "Helmet label" }),
  ).toBeVisible();
  await expect(labelPage.locator(".helmet-label>img")).toHaveJSProperty(
    "complete",
    true,
  );
  await labelPage.close();
  await page.getByRole("button", { name: "Add qualification" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  for (const [route, heading] of [
    ["matrix", "Skills matrix"],
    ["competencies", "Competencies"],
    ["documents", "Documents"],
    ["passports", "QR passports"],
    ["reports", "Excel connection"],
  ]) {
    await page.goto(base + "/workspace/" + route);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "/workspace");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator(".sidebar")).toHaveClass(/open/);
  await page.getByRole("link", { name: "Skills matrix", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Skills matrix", exact: true }),
  ).toBeVisible();
  const publicContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const publicPage = await publicContext.newPage();
  await publicPage.goto(base + passportUrl);
  await expect(
    publicPage.getByRole("heading", { name: "Thomas Bernard" }),
  ).toBeVisible();
  await expect(publicPage.getByText("DEMO-1-001")).toHaveCount(0);
  const overflow = await publicPage.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await publicPage.screenshot({
    path: ".local/screenshots/public-mobile.png",
    fullPage: true,
  });
  await publicContext.close();
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto(base + "/workspace/employees");
  await page.getByRole("button", { name: "Add employee", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill(testId);
  await page.getByLabel("Employee ID / SSN", { exact: true }).fill(testId);
  await page.getByLabel("Job title", { exact: true }).fill("Test technician");
  await page.getByLabel("Department", { exact: true }).fill("QA");
  await page.getByLabel("Site", { exact: true }).fill("Test site");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Search employees", { exact: true }).fill(testId);
  await page.getByRole("link", { name: "View " + testId, exact: true }).click();
  await page
    .getByRole("button", { name: "Add qualification", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .locator('select[name="competencyId"]')
    .selectOption({ index: 1 });
  await page.getByLabel("Issuing organization", { exact: true }).fill(testId);
  await page.getByLabel("Valid from", { exact: true }).fill("2026-01-01");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Pending review", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Upload diploma", exact: true })
    .click();
  await page.getByLabel("Choose file", { exact: true }).setInputFiles({
    name: "browser-evidence.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await page.getByRole("button", { name: "Upload file", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "browser-evidence.png" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mark verified", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByText("Verified", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
  console.log(
    "PASS desktop navigation, company persistence, themes, search, print label, mobile passport, employee creation, qualification creation, diploma upload, HR verification and no browser errors.",
  );
} finally {
  await browser.close();
  const employees = await rows<{ id: string }>(
    "SELECT id FROM employees WHERE ssn=?",
    [testId],
  );
  for (const employee of employees) {
    const files = await rows<{ storage_name: string }>(
      "SELECT storage_name FROM documents WHERE employee_id=?",
      [employee.id],
    );
    await execute("DELETE FROM documents WHERE employee_id=?", [employee.id]);
    for (const file of files)
      await unlink(
        path.join(process.env.UPLOAD_DIR || "uploads", file.storage_name),
      ).catch(() => {});
    await execute("DELETE FROM qualifications WHERE employee_id=?", [
      employee.id,
    ]);
    await execute("DELETE FROM employees WHERE id=?", [employee.id]);
  }
  await execute("DELETE FROM audit_events WHERE subject LIKE ?", [
    "%" + testId + "%",
  ]);
  await pool().end();
}
