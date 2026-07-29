"use strict";

const { createHmac } = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { logger } = require("firebase-functions");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const {
  PayloadValidationError,
  escapeHtml,
  normalizeIp,
  validatePayload,
} = require("./contact");

initializeApp();

const db = getFirestore();
const resendApiKey = defineSecret("RESEND_API_KEY");
const rateLimitSecret = defineSecret("RATE_LIMIT_SECRET");
const contactToEmail = "umitcagdas@gmail.com";
const contactFromEmail = "Ümit Çağdaş Portföy <onboarding@resend.dev>";

const rateLimitCollection = "contactRateLimits";
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitWindowMaximum = 3;
const rateLimitDayMaximum = 10;

class RateLimitError extends Error {}

function utcDay(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

async function enforceRateLimit(rawRequest) {
  const clientIp = normalizeIp(
    rawRequest?.ip || rawRequest?.socket?.remoteAddress,
  );
  const identifier = createHmac("sha256", rateLimitSecret.value())
    .update(clientIp)
    .digest("hex");
  const reference = db.collection(rateLimitCollection).doc(identifier);
  const now = Date.now();
  const today = utcDay(now);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    const previous = snapshot.exists ? snapshot.data() : {};
    const sameWindow =
      Number.isFinite(previous.windowStartMs) &&
      now - previous.windowStartMs < rateLimitWindowMs;
    const windowCount = sameWindow ? previous.windowCount ?? 0 : 0;
    const dayCount = previous.day === today ? previous.dayCount ?? 0 : 0;

    if (
      windowCount >= rateLimitWindowMaximum ||
      dayCount >= rateLimitDayMaximum
    ) {
      throw new RateLimitError();
    }

    transaction.set(reference, {
      windowStartMs: sameWindow ? previous.windowStartMs : now,
      windowCount: windowCount + 1,
      day: today,
      dayCount: dayCount + 1,
      lastSeenAt: Timestamp.fromMillis(now),
      expiresAt: Timestamp.fromMillis(now + 8 * 24 * 60 * 60 * 1000),
    });
  });
}

function emailContent(message) {
  const safe = {
    name: escapeHtml(message.name),
    email: escapeHtml(message.email),
    company: escapeHtml(message.company || "Belirtilmedi"),
    projectLabel: escapeHtml(message.projectLabel),
    message: escapeHtml(message.message).replace(/\n/g, "<br>"),
  };

  const text = [
    "Yeni portföy mesajı",
    "",
    `Ad soyad: ${message.name}`,
    `E-posta: ${message.email}`,
    `Şirket: ${message.company || "Belirtilmedi"}`,
    `Proje türü: ${message.projectLabel}`,
    "",
    message.message,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#111211">
      <div style="padding:28px;background:#111211;color:#fff">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9cf45b">umitcagdas.github.io</div>
        <h1 style="margin:12px 0 0;font-size:28px">Yeni proje mesajı</h1>
      </div>
      <div style="padding:28px;border:1px solid #e3e3df;border-top:0">
        <p><strong>Ad soyad:</strong> ${safe.name}</p>
        <p><strong>E-posta:</strong> ${safe.email}</p>
        <p><strong>Şirket:</strong> ${safe.company}</p>
        <p><strong>Proje türü:</strong> ${safe.projectLabel}</p>
        <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e3e3df;line-height:1.7">
          ${safe.message}
        </div>
      </div>
    </div>
  `;

  return { text, html };
}

async function deliverEmail(message) {
  const content = emailContent(message);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey.value()}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact-${message.submissionId}`,
    },
    body: JSON.stringify({
      from: contactFromEmail,
      to: [contactToEmail],
      reply_to: message.email,
      subject: `[Portföy] ${message.projectLabel} — ${message.name}`,
      text: content.text,
      html: content.html,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    logger.error("Contact email provider rejected the request", {
      status: response.status,
      submissionId: message.submissionId,
    });
    throw new Error("email-provider-error");
  }

  return typeof result.id === "string" ? result.id : "accepted";
}

exports.sendContactMessage = onCall(
  {
    region: "europe-west1",
    cors: ["https://umitcagdas.github.io"],
    enforceAppCheck: true,
    secrets: [resendApiKey, rateLimitSecret],
    timeoutSeconds: 15,
    memory: "256MiB",
    minInstances: 0,
    maxInstances: 3,
    concurrency: 10,
  },
  async (request) => {
    let message;

    try {
      message = validatePayload(request.data);
      await enforceRateLimit(request.rawRequest);
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw new HttpsError(
          "resource-exhausted",
          "Please wait before sending another message.",
        );
      }

      if (error instanceof PayloadValidationError) {
        throw new HttpsError("invalid-argument", "Invalid form data.");
      }

      logger.error("Contact request validation failed", {
        errorType: error?.name || "UnknownError",
      });
      throw new HttpsError("internal", "The message could not be processed.");
    }

    try {
      const providerId = await deliverEmail(message);
      logger.info("Contact message delivered", {
        submissionId: message.submissionId,
        providerId,
      });
      return { ok: true };
    } catch {
      throw new HttpsError(
        "unavailable",
        "The message service is temporarily unavailable.",
      );
    }
  },
);
