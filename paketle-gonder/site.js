(() => {
  const canonical = document.querySelector('link[rel="canonical"]');
  const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
  if (legacyHosts.includes(location.hostname) && /^\/paketle-gonder(?:\/|$)/.test(location.pathname)) {
    const target = new URL(canonical.href);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
    return;
  }

  const labels = {
    en: ["Pack & Send", "Support", "Privacy"],
    tr: ["Paketle & Gönder", "Destek", "Gizlilik"],
    de: ["Packen & Senden", "Support", "Datenschutz"],
    fr: ["Emballe & Envoie", "Assistance", "Confidentialité"],
    es: ["Empaca y Envía", "Soporte", "Privacidad"],
    it: ["Imballa e Spedisci", "Assistenza", "Privacy"],
    nl: ["Inpakken & Versturen", "Ondersteuning", "Privacy"],
    el: ["Πακετάρισε & Στείλε", "Υποστήριξη", "Απόρρητο"],
    sq: ["Paketo & Dërgo", "Mbështetje", "Privatësia"],
  };
  const current = new URL(location.href);
  const page = document.body.dataset.page;
  const requested = current.searchParams.get("lang");
  function language() {
    if (page === "privacy" && ["#tr", "#en"].includes(current.hash)) return current.hash.slice(1);
    if (requested !== null) return Object.hasOwn(labels, requested) ? requested : "en";
    if (page === "index") {
      for (const tag of navigator.languages || [navigator.language]) {
        const code = tag.toLowerCase().split("-")[0];
        if (Object.hasOwn(labels, code)) return code;
      }
    }
    return "en";
  }
  const lang = language();
  const [brand, support, privacy] = labels[lang];

  for (const anchor of document.querySelectorAll("[data-page-link]")) {
    const destination = anchor.dataset.pageLink;
    const target = new URL(anchor.getAttribute("href"), current);
    const label = destination === "home" ? brand : destination === "support" ? support : privacy;
    (anchor.querySelector("strong") || anchor).textContent = label;
    if (lang !== "en") target.searchParams.set("lang", lang);
    if (destination === "privacy") target.hash = lang === "tr" ? "tr" : "en";
    anchor.href = target.href;
  }
  // The full English and Turkish legal texts are always available at their original anchors.
  if (page === "privacy") return;

  document.documentElement.lang = lang;
  if (page === "support") document.querySelector(".eyebrow").textContent = brand + " · " + support;
  for (const article of document.querySelectorAll("article[data-lang]")) {
    article.hidden = article.dataset.lang !== lang;
  }
  for (const anchor of document.querySelectorAll(".languages a")) {
    const target = new URL(current);
    target.searchParams.set("lang", anchor.lang);
    anchor.href = target.href;
    if (anchor.lang === lang) anchor.setAttribute("aria-current", "page");
  }
  const article = document.querySelector('article[data-lang="' + lang + '"]');
  const title = page === "index" ? brand + " · " + article.querySelector("h2").textContent : support + " · " + brand;
  const description = article.querySelector("p").textContent;
  document.title = title;
  document.querySelector('meta[name="description"]').content = description;
  document.querySelector('meta[property="og:title"]').content = title;
  document.querySelector('meta[property="og:description"]').content = description;
  if (lang !== "en") {
    const localized = new URL(canonical.href);
    localized.searchParams.set("lang", lang);
    canonical.href = localized.href;
  }
  document.querySelector('meta[property="og:url"]').content = canonical.href;
})();
