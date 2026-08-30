(() => {
  "use strict";

  const supportedLanguages = ["tr", "en", "de", "el", "sq"];
  const copies = {
    tr: {
      home: "Ana Sayfa",
      updates: "Yenilikler",
      support: "Destek",
      privacy: "Gizlilik",
      eyebrow: "Sürüm geçmişi",
      title: "Yenilikler",
      intro: "Pişti Online'ın en yeni özelliklerini ve yakın sürümlerin kısa arşivini inceleyin.",
      appStore: "App Store'dan İndir",
      marketingSite: "Oyun sitesine dön",
      pageTitle: "Yenilikler | Pişti: Online",
      description: "Pişti Online'ın en yeni özelliklerini ve yakın sürümlerin kısa arşivini inceleyin."
    },
    en: {
      home: "Home",
      updates: "What's New",
      support: "Support",
      privacy: "Privacy",
      eyebrow: "Release history",
      title: "What's New",
      intro: "Discover the latest Pişti Online features and browse a concise archive of recent releases.",
      appStore: "Download on the App Store",
      marketingSite: "Back to the game site",
      pageTitle: "What's New | Pişti: Online",
      description: "Discover the latest Pişti Online features and recent release notes."
    },
    de: {
      home: "Startseite",
      updates: "Neuerungen",
      support: "Support",
      privacy: "Datenschutz",
      eyebrow: "Versionsverlauf",
      title: "Neuerungen",
      intro: "Entdecke die neuesten Funktionen von Pişti Online und das kompakte Archiv der letzten Versionen.",
      appStore: "Im App Store laden",
      marketingSite: "Zurück zur Spieleseite",
      pageTitle: "Neuerungen | Pişti: Online",
      description: "Die neuesten Funktionen und Versionshinweise von Pişti Online."
    },
    el: {
      home: "Αρχική",
      updates: "Τι νέο υπάρχει",
      support: "Υποστήριξη",
      privacy: "Απόρρητο",
      eyebrow: "Ιστορικό εκδόσεων",
      title: "Τι νέο υπάρχει",
      intro: "Ανακάλυψε τις τελευταίες λειτουργίες του Pişti Online και ένα σύντομο αρχείο πρόσφατων εκδόσεων.",
      appStore: "Λήψη από το App Store",
      marketingSite: "Επιστροφή στη σελίδα του παιχνιδιού",
      pageTitle: "Τι νέο υπάρχει | Pişti: Online",
      description: "Οι πιο πρόσφατες λειτουργίες και σημειώσεις εκδόσεων του Pişti Online."
    },
    sq: {
      home: "Kreu",
      updates: "Çfarë ka të re",
      support: "Mbështetja",
      privacy: "Privatësia",
      eyebrow: "Historiku i versioneve",
      title: "Çfarë ka të re",
      intro: "Zbulo veçoritë më të fundit të Pişti Online dhe një arkiv të shkurtër të versioneve të fundit.",
      appStore: "Shkarko në App Store",
      marketingSite: "Kthehu te faqja e lojës",
      pageTitle: "Çfarë ka të re | Pişti: Online",
      description: "Veçoritë më të fundit dhe shënimet e versioneve të Pişti Online."
    }
  };

  const normalizeLanguage = (value) => {
    const language = String(value || "").trim().toLowerCase().split("-", 1)[0];
    return supportedLanguages.includes(language) ? language : null;
  };

  const queryLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get("lang"));
  const browserLanguage = (navigator.languages || [navigator.language])
    .map(normalizeLanguage)
    .find(Boolean);
  const language = queryLanguage || browserLanguage || "tr";
  const copy = copies[language];

  document.documentElement.lang = language;
  document.title = copy.pageTitle;

  const description = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (description) description.content = copy.description;
  if (ogTitle) ogTitle.content = copy.pageTitle;
  if (ogDescription) ogDescription.content = copy.description;

  document.querySelectorAll("[data-copy]").forEach((element) => {
    const value = copy[element.dataset.copy];
    if (value) element.textContent = value;
  });

  document.querySelectorAll("[data-language-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.languagePanel !== language;
  });

  document.querySelectorAll("[data-language-link]").forEach((link) => {
    const isCurrent = link.dataset.languageLink === language;
    link.toggleAttribute("aria-current", isCurrent);
    link.classList.toggle("active", isCurrent);
  });
})();
