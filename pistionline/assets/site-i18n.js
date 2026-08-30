(() => {
  "use strict";

  const supportedLanguages = ["tr", "en", "de", "el", "sq"];
  const localeTags = {
    tr: "tr_TR",
    en: "en_US",
    de: "de_DE",
    el: "el_GR",
    sq: "sq_AL",
  };
  const commonCopy = {
    tr: {
      "aria.home": "Pişti Online ana sayfa",
      "aria.sections": "Sayfa bölümleri",
      "nav.home": "Ana Sayfa",
      "nav.features": "Özellikler",
      "nav.screens": "Ekranlar",
      "nav.updates": "Yenilikler",
      "nav.support": "Destek",
      "nav.privacy": "Gizlilik",
      "nav.accountDeletion": "Hesap Silme",
      "footer.privacy": "Gizlilik Politikası",
      "footer.developer": "Geliştirici: Ümit Çağdaş",
      "footer.personal": "Kişisel site",
      "footer.supportTitle": "Pişti: Online Destek",
    },
    en: {
      "aria.home": "Pişti Online home page",
      "aria.sections": "Page sections",
      "nav.home": "Home",
      "nav.features": "Features",
      "nav.screens": "Screens",
      "nav.updates": "What's New",
      "nav.support": "Support",
      "nav.privacy": "Privacy",
      "nav.accountDeletion": "Delete Account",
      "footer.privacy": "Privacy Policy",
      "footer.developer": "Developer: Ümit Çağdaş",
      "footer.personal": "Personal site",
      "footer.supportTitle": "Pişti: Online Support",
    },
    de: {
      "aria.home": "Pişti Online Startseite",
      "aria.sections": "Seitenbereiche",
      "nav.home": "Startseite",
      "nav.features": "Funktionen",
      "nav.screens": "Bildschirme",
      "nav.updates": "Neuerungen",
      "nav.support": "Support",
      "nav.privacy": "Datenschutz",
      "nav.accountDeletion": "Konto löschen",
      "footer.privacy": "Datenschutzerklärung",
      "footer.developer": "Entwickler: Ümit Çağdaş",
      "footer.personal": "Persönliche Website",
      "footer.supportTitle": "Pişti: Online Support",
    },
    el: {
      "aria.home": "Αρχική σελίδα Pişti Online",
      "aria.sections": "Ενότητες σελίδας",
      "nav.home": "Αρχική",
      "nav.features": "Λειτουργίες",
      "nav.screens": "Οθόνες",
      "nav.updates": "Τι νέο υπάρχει",
      "nav.support": "Υποστήριξη",
      "nav.privacy": "Απόρρητο",
      "nav.accountDeletion": "Διαγραφή λογαριασμού",
      "footer.privacy": "Πολιτική απορρήτου",
      "footer.developer": "Προγραμματιστής: Ümit Çağdaş",
      "footer.personal": "Προσωπική ιστοσελίδα",
      "footer.supportTitle": "Υποστήριξη Pişti: Online",
    },
    sq: {
      "aria.home": "Faqja kryesore e Pişti Online",
      "aria.sections": "Seksionet e faqes",
      "nav.home": "Kreu",
      "nav.features": "Veçoritë",
      "nav.screens": "Ekranet",
      "nav.updates": "Çfarë ka të re",
      "nav.support": "Mbështetja",
      "nav.privacy": "Privatësia",
      "nav.accountDeletion": "Fshi llogarinë",
      "footer.privacy": "Politika e privatësisë",
      "footer.developer": "Zhvilluesi: Ümit Çağdaş",
      "footer.personal": "Faqja personale",
      "footer.supportTitle": "Mbështetja e Pişti: Online",
    },
  };

  const pageTranslations = window.PistiPageI18n || {};

  function normalizeLanguage(value) {
    const normalized = String(value || "")
      .trim()
      .toLowerCase()
      .split("-")[0];
    return supportedLanguages.includes(normalized) ? normalized : null;
  }

  function readStoredLanguage() {
    try {
      return normalizeLanguage(window.localStorage.getItem("pisti-site-language"));
    } catch (_) {
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem("pisti-site-language", language);
    } catch (_) {
      // Language selection still works through the URL when storage is blocked.
    }
  }

  function resolveLanguage() {
    const queryLanguage = normalizeLanguage(
      new URLSearchParams(window.location.search).get("lang"),
    );
    if (queryLanguage) {
      storeLanguage(queryLanguage);
      return queryLanguage;
    }

    const storedLanguage = readStoredLanguage();
    if (storedLanguage) return storedLanguage;

    for (const candidate of navigator.languages || [navigator.language]) {
      const browserLanguage = normalizeLanguage(candidate);
      if (browserLanguage) return browserLanguage;
    }
    return "tr";
  }

  function setMeta(selector, value) {
    if (!value) return;
    const element = document.querySelector(selector);
    if (element) element.setAttribute("content", value);
  }

  function applyMetadata(language, pageCopy) {
    const meta = pageCopy.meta || {};
    if (meta.title) document.title = meta.title;
    setMeta('meta[name="description"]', meta.description);
    setMeta('meta[property="og:title"]', meta.title);
    setMeta('meta[property="og:description"]', meta.description);
    setMeta('meta[name="twitter:title"]', meta.title);
    setMeta('meta[name="twitter:description"]', meta.description);
    setMeta('meta[property="og:locale"]', localeTags[language]);

    const pageUrl = new URL(window.location.href);
    pageUrl.hash = "";
    pageUrl.search = language === "tr" ? "" : `?lang=${language}`;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl.href;
    setMeta('meta[property="og:url"]', pageUrl.href);

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
      link.remove();
    });
    for (const alternateLanguage of supportedLanguages) {
      const alternate = document.createElement("link");
      const alternateUrl = new URL(pageUrl.href);
      alternateUrl.search = alternateLanguage === "tr" ? "" : `?lang=${alternateLanguage}`;
      alternate.rel = "alternate";
      alternate.hreflang = alternateLanguage;
      alternate.href = alternateUrl.href;
      document.head.appendChild(alternate);
    }
    const fallback = document.createElement("link");
    const fallbackUrl = new URL(pageUrl.href);
    fallbackUrl.search = "";
    fallback.rel = "alternate";
    fallback.hreflang = "x-default";
    fallback.href = fallbackUrl.href;
    document.head.appendChild(fallback);
  }

  function applyCommonCopy(language) {
    const copy = commonCopy[language] || commonCopy.tr;
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = copy[element.dataset.i18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      const value = copy[element.dataset.i18nAria];
      if (value) element.setAttribute("aria-label", value);
    });
  }

  function applyPageCopy(language, pageCopy) {
    const blocks = pageCopy.blocks || {};
    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      const value = blocks[element.dataset.i18nHtml];
      if (value) element.innerHTML = value;
    });
    const copy = pageCopy.copy || {};
    document.querySelectorAll("[data-copy]").forEach((element) => {
      const value = copy[element.dataset.copy];
      if (value) element.textContent = value;
    });
    document.querySelectorAll("[data-language-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.languagePanel !== language;
    });
    document.querySelectorAll("[data-secondary-summary]").forEach((summary) => {
      summary.hidden = language !== "tr";
    });
  }

  function localizedUrl(language) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", language);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function addLanguagePicker(language) {
    const header = document.querySelector(".site-header");
    if (!header || header.querySelector("[data-language-select]")) return;

    const label = document.createElement("label");
    label.className = "site-language-picker";
    const hiddenLabel = document.createElement("span");
    hiddenLabel.className = "visually-hidden";
    hiddenLabel.textContent = "Dil / Language";
    const select = document.createElement("select");
    select.setAttribute("data-language-select", "");
    select.setAttribute("aria-label", "Dil / Language");
    const labels = {
      tr: "Türkçe",
      en: "English",
      de: "Deutsch",
      el: "Ελληνικά",
      sq: "Shqip",
    };
    for (const optionLanguage of supportedLanguages) {
      const option = document.createElement("option");
      option.value = optionLanguage;
      option.textContent = labels[optionLanguage];
      option.selected = optionLanguage === language;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      const selectedLanguage = normalizeLanguage(select.value);
      if (!selectedLanguage) return;
      storeLanguage(selectedLanguage);
      window.location.assign(localizedUrl(selectedLanguage));
    });
    label.append(hiddenLabel, select);
    header.appendChild(label);
  }

  function localizeLanguageLinks(language) {
    document.querySelectorAll("[data-language-link]").forEach((link) => {
      const linkLanguage = normalizeLanguage(link.dataset.languageLink);
      if (!linkLanguage) return;
      link.href = localizedUrl(linkLanguage);
      if (linkLanguage === language) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function localizeInternalLinks(language) {
    document.querySelectorAll("a[href]").forEach((link) => {
      if (link.hasAttribute("data-language-link")) return;
      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;
      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch (_) {
        return;
      }
      if (
        url.origin !== window.location.origin ||
        !url.pathname.includes("/pistionline/")
      ) {
        return;
      }
      url.searchParams.set("lang", language);
      link.href = `${url.pathname}${url.search}${url.hash}`;
    });
  }

  const language = resolveLanguage();
  const pageCopy = pageTranslations[language] || pageTranslations.tr || {};
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  applyMetadata(language, pageCopy);
  applyCommonCopy(language);
  applyPageCopy(language, pageCopy);
  addLanguagePicker(language);
  localizeLanguageLinks(language);
  localizeInternalLinks(language);
})();
