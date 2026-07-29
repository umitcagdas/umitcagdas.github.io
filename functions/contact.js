"use strict";

const PROJECT_LABELS = Object.freeze({
  b2b: "B2B platform",
  corporate_web: "Kurumsal web",
  digital_product: "Dijital ürün",
  other: "Diğer",
});

const SUBMISSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

class PayloadValidationError extends Error {}

function singleLine(value, field, maxLength, required = true) {
  if (typeof value !== "string") {
    throw new PayloadValidationError(field);
  }

  const normalized = value.trim().replace(/\s+/g, " ");

  if ((required && normalized.length === 0) || normalized.length > maxLength) {
    throw new PayloadValidationError(field);
  }

  return normalized;
}

function normalizeMessage(value) {
  if (typeof value !== "string") {
    throw new PayloadValidationError("message");
  }

  const normalized = value
    .trim()
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");

  if (normalized.length < 20 || normalized.length > 3000) {
    throw new PayloadValidationError("message");
  }

  return normalized;
}

function validatePayload(data, now = Date.now()) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new PayloadValidationError("payload");
  }

  if (typeof data.website !== "string" || data.website.trim() !== "") {
    throw new PayloadValidationError("website");
  }

  if (data.privacyAccepted !== true) {
    throw new PayloadValidationError("privacyAccepted");
  }

  if (!Number.isFinite(data.startedAt)) {
    throw new PayloadValidationError("startedAt");
  }

  const elapsed = now - data.startedAt;
  if (elapsed < 1500 || elapsed > 2 * 60 * 60 * 1000) {
    throw new PayloadValidationError("startedAt");
  }

  if (
    typeof data.submissionId !== "string" ||
    !SUBMISSION_ID_PATTERN.test(data.submissionId)
  ) {
    throw new PayloadValidationError("submissionId");
  }

  const name = singleLine(data.name, "name", 80);
  const email = singleLine(data.email, "email", 254).toLowerCase();
  const company = singleLine(data.company ?? "", "company", 100, false);
  const message = normalizeMessage(data.message);

  if (
    name.length < 2 ||
    /[\r\n]/.test(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email)
  ) {
    throw new PayloadValidationError("identity");
  }

  if (
    typeof data.projectType !== "string" ||
    !Object.hasOwn(PROJECT_LABELS, data.projectType)
  ) {
    throw new PayloadValidationError("projectType");
  }

  return {
    name,
    email,
    company,
    message,
    projectType: data.projectType,
    projectLabel: PROJECT_LABELS[data.projectType],
    submissionId: data.submissionId,
  };
}

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function normalizeIp(value) {
  if (typeof value !== "string" || value.trim() === "") return "unknown";
  return value.trim().replace(/^::ffff:/, "").slice(0, 64);
}

module.exports = {
  PayloadValidationError,
  escapeHtml,
  normalizeIp,
  validatePayload,
};
