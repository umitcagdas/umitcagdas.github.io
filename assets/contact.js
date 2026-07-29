import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js";

const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyAe9m1YWV9PK6ApoVZjHOFeD3Xq1izBwvw",
  authDomain: "umitcagdas-portfolio-2026.firebaseapp.com",
  projectId: "umitcagdas-portfolio-2026",
  storageBucket: "umitcagdas-portfolio-2026.firebasestorage.app",
  messagingSenderId: "64061568008",
  appId: "1:64061568008:web:0152894a8d23ffce9d4dbd",
});

const appCheckSiteKey = "6LclPGstAAAAALSRMQltpcVEI8FMdjP7XZ1im3bF";
const form = document.querySelector("#contact-form");
const status = document.querySelector("#contact-form-status");
const submitButton = form?.querySelector('button[type="submit"]');
const submitLabel = submitButton?.querySelector("span");
let startedAt = Date.now();
let sendContactMessage;

function setStatus(message, state = "") {
  if (!status) return;
  status.textContent = message;

  if (state) {
    status.dataset.state = state;
  } else {
    delete status.dataset.state;
  }
}

function friendlyError(code) {
  const messages = {
    "functions/invalid-argument":
      "Bilgileri kontrol edip eksik alanları tamamlar mısınız?",
    "functions/resource-exhausted":
      "Kısa sürede çok fazla deneme yapıldı. Lütfen biraz sonra yeniden deneyin.",
    "functions/unauthenticated":
      "Güvenlik doğrulaması tamamlanamadı. Sayfayı yenileyip tekrar deneyin.",
    "functions/failed-precondition":
      "Güvenlik doğrulaması tamamlanamadı. Sayfayı yenileyip tekrar deneyin.",
    "functions/deadline-exceeded":
      "Yanıt biraz gecikti. Lütfen birkaç dakika sonra yeniden deneyin.",
    "functions/unavailable":
      "Gönderim servisine şu anda ulaşılamıyor. Lütfen biraz sonra yeniden deneyin.",
    "functions/not-found":
      "Form şu anda devreye alınıyor. Bu sırada doğrudan e-posta gönderebilirsiniz.",
  };

  return (
    messages[code] ||
    "Mesaj gönderilemedi. Lütfen tekrar deneyin veya doğrudan e-posta gönderin."
  );
}

try {
  const app = initializeApp(firebaseConfig);

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });

  const functions = getFunctions(app, "europe-west1");
  sendContactMessage = httpsCallable(functions, "sendContactMessage", {
    timeout: 20000,
  });
} catch {
  setStatus(
    "Güvenli form başlatılamadı. Lütfen doğrudan e-posta bağlantısını kullanın.",
    "error",
  );
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  if (!sendContactMessage) {
    setStatus(
      "Form şu anda kullanılamıyor. Lütfen doğrudan e-posta gönderin.",
      "error",
    );
    return;
  }

  const formData = new FormData(form);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    projectType: formData.get("projectType"),
    message: formData.get("message"),
    privacyAccepted: formData.get("privacyAccepted") === "on",
    website: formData.get("website"),
    startedAt,
    submissionId: crypto.randomUUID(),
  };

  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitLabel.textContent = "Gönderiliyor…";
  setStatus("Mesajınız güvenli biçimde iletiliyor.");

  try {
    await sendContactMessage(payload);
    form.reset();
    startedAt = Date.now();
    setStatus(
      "Mesajınız ulaştı. En kısa sürede size dönüş yapacağım.",
      "success",
    );
  } catch (error) {
    setStatus(friendlyError(error?.code), "error");
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");
    submitLabel.textContent = "Mesajı güvenle gönder";
  }
});
