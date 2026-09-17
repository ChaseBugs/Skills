import test from "node:test";
import assert from "node:assert/strict";
import { validity, csvCell } from "../lib/domain";
const today = "2026-09-17";
test("expiry is inclusive and reminders cover 30 days", () => {
  assert.equal(
    validity({ validFrom: "2026-01-01", expiresOn: today }, today),
    "Expiring soon",
  );
  assert.equal(
    validity({ validFrom: "2026-01-01", expiresOn: "2026-09-16" }, today),
    "Expired",
  );
  assert.equal(
    validity({ validFrom: "2026-01-01", expiresOn: "2026-10-17" }, today),
    "Expiring soon",
  );
  assert.equal(
    validity({ validFrom: "2026-01-01", expiresOn: "2026-10-18" }, today),
    "Valid",
  );
});
test("permanent, upcoming, and revoked qualifications remain distinct", () => {
  assert.equal(
    validity({ validFrom: "2026-01-01", expiresOn: null }, today),
    "Valid",
  );
  assert.equal(
    validity({ validFrom: "2026-10-01", expiresOn: null }, today),
    "Upcoming",
  );
  assert.equal(
    validity(
      { validFrom: "2026-10-01", expiresOn: null, revoked: true },
      today,
    ),
    "Revoked",
  );
});
test("CSV escapes quotes and neutralizes formula prefixes", () => {
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
  assert.equal(csvCell("Smith, Jane"), '"Smith, Jane"');
  assert.equal(csvCell("Normal"), '"Normal"');
});
