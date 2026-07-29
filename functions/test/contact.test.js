"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  PayloadValidationError,
  escapeHtml,
  normalizeIp,
  validatePayload,
} = require("../contact");

function validPayload(now) {
  return {
    name: "Ümit Çağdaş",
    email: "umit@example.com",
    company: "Örnek Şirket",
    projectType: "b2b",
    message: "Yeni bir B2B projesi hakkında görüşmek istiyorum.",
    privacyAccepted: true,
    website: "",
    startedAt: now - 5000,
    submissionId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  };
}

test("valid contact data is normalized", () => {
  const now = Date.now();
  const result = validatePayload(validPayload(now), now);

  assert.equal(result.email, "umit@example.com");
  assert.equal(result.projectLabel, "B2B platform");
  assert.equal(result.company, "Örnek Şirket");
});

test("honeypot submissions are rejected", () => {
  const now = Date.now();
  const payload = validPayload(now);
  payload.website = "https://spam.example";

  assert.throws(
    () => validatePayload(payload, now),
    PayloadValidationError,
  );
});

test("submissions sent too quickly are rejected", () => {
  const now = Date.now();
  const payload = validPayload(now);
  payload.startedAt = now - 500;

  assert.throws(
    () => validatePayload(payload, now),
    PayloadValidationError,
  );
});

test("unexpected project types are rejected", () => {
  const now = Date.now();
  const payload = validPayload(now);
  payload.projectType = "anything";

  assert.throws(
    () => validatePayload(payload, now),
    PayloadValidationError,
  );
});

test("email HTML is escaped", () => {
  assert.equal(
    escapeHtml('<script>alert("x")</script>'),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
});

test("IPv4-mapped addresses are normalized", () => {
  assert.equal(normalizeIp("::ffff:203.0.113.10"), "203.0.113.10");
});
