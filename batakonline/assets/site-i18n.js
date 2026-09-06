(() => {
  "use strict";

  const supportedLanguages = ["tr", "en", "de", "el", "es", "fr", "it", "nl"];
  const languageLabels = {
    tr: "Türkçe",
    en: "English",
    de: "Deutsch",
    el: "Ελληνικά",
    es: "Español",
    fr: "Français",
    it: "Italiano",
    nl: "Nederlands",
  };
  const localeTags = {
    tr: "tr_TR",
    en: "en_US",
    de: "de_DE",
    el: "el_GR",
    es: "es_ES",
    fr: "fr_FR",
    it: "it_IT",
    nl: "nl_NL",
  };
  const commonCopy = {
    tr: {
      "aria.home": "Batak: Online ana sayfa",
      "aria.sections": "Sayfa bölümleri",
      "nav.home": "Ana Sayfa",
      "nav.features": "Özellikler",
      "nav.modes": "Oyun modları",
      "nav.screens": "Ekranlar",
      "nav.support": "Destek",
      "nav.privacy": "Gizlilik",
      "nav.accountDeletion": "Hesap Silme",
      "footer.privacy": "Gizlilik Politikası",
      "footer.developer": "Geliştirici: Ümit Çağdaş",
      "footer.personal": "Kişisel site",
    },
    en: {
      "aria.home": "Batak: Online home page",
      "aria.sections": "Page sections",
      "nav.home": "Home",
      "nav.features": "Features",
      "nav.modes": "Game modes",
      "nav.screens": "Screens",
      "nav.support": "Support",
      "nav.privacy": "Privacy",
      "nav.accountDeletion": "Delete Account",
      "footer.privacy": "Privacy Policy",
      "footer.developer": "Developer: Ümit Çağdaş",
      "footer.personal": "Personal site",
    },
    de: {
      "aria.home": "Batak: Online Startseite",
      "aria.sections": "Seitenbereiche",
      "nav.home": "Startseite",
      "nav.features": "Funktionen",
      "nav.modes": "Spielmodi",
      "nav.screens": "Bildschirme",
      "nav.support": "Support",
      "nav.privacy": "Datenschutz",
      "nav.accountDeletion": "Konto löschen",
      "footer.privacy": "Datenschutzerklärung",
      "footer.developer": "Entwickler: Ümit Çağdaş",
      "footer.personal": "Persönliche Website",
    },
    el: {
      "aria.home": "Αρχική σελίδα Batak: Online",
      "aria.sections": "Ενότητες σελίδας",
      "nav.home": "Αρχική",
      "nav.features": "Λειτουργίες",
      "nav.modes": "Τρόποι παιχνιδιού",
      "nav.screens": "Οθόνες",
      "nav.support": "Υποστήριξη",
      "nav.privacy": "Απόρρητο",
      "nav.accountDeletion": "Διαγραφή λογαριασμού",
      "footer.privacy": "Πολιτική απορρήτου",
      "footer.developer": "Προγραμματιστής: Ümit Çağdaş",
      "footer.personal": "Προσωπική ιστοσελίδα",
    },
    es: {
      "aria.home": "Página de inicio de Batak: Online",
      "aria.sections": "Secciones de la página",
      "nav.home": "Inicio",
      "nav.features": "Funciones",
      "nav.modes": "Modos de juego",
      "nav.screens": "Pantallas",
      "nav.support": "Soporte",
      "nav.privacy": "Privacidad",
      "nav.accountDeletion": "Eliminar cuenta",
      "footer.privacy": "Política de privacidad",
      "footer.developer": "Desarrollador: Ümit Çağdaş",
      "footer.personal": "Sitio personal",
    },
    fr: {
      "aria.home": "Page d’accueil de Batak: Online",
      "aria.sections": "Sections de la page",
      "nav.home": "Accueil",
      "nav.features": "Fonctionnalités",
      "nav.modes": "Modes de jeu",
      "nav.screens": "Écrans",
      "nav.support": "Assistance",
      "nav.privacy": "Confidentialité",
      "nav.accountDeletion": "Supprimer le compte",
      "footer.privacy": "Politique de confidentialité",
      "footer.developer": "Développeur : Ümit Çağdaş",
      "footer.personal": "Site personnel",
    },
    it: {
      "aria.home": "Pagina iniziale di Batak: Online",
      "aria.sections": "Sezioni della pagina",
      "nav.home": "Home",
      "nav.features": "Funzioni",
      "nav.modes": "Modalità di gioco",
      "nav.screens": "Schermate",
      "nav.support": "Assistenza",
      "nav.privacy": "Privacy",
      "nav.accountDeletion": "Elimina account",
      "footer.privacy": "Informativa sulla privacy",
      "footer.developer": "Sviluppatore: Ümit Çağdaş",
      "footer.personal": "Sito personale",
    },
    nl: {
      "aria.home": "Startpagina van Batak: Online",
      "aria.sections": "Paginaonderdelen",
      "nav.home": "Start",
      "nav.features": "Functies",
      "nav.modes": "Spelmodi",
      "nav.screens": "Schermen",
      "nav.support": "Ondersteuning",
      "nav.privacy": "Privacy",
      "nav.accountDeletion": "Account verwijderen",
      "footer.privacy": "Privacybeleid",
      "footer.developer": "Ontwikkelaar: Ümit Çağdaş",
      "footer.personal": "Persoonlijke site",
    },
  };

  const pageTranslations = window.BatakPageI18n || {};

  function normalizeLanguage(value) {
    const normalized = String(value || "").trim().toLowerCase().split("-")[0];
    return supportedLanguages.includes(normalized) ? normalized : null;
  }

  function readStoredLanguage() {
    try {
      return normalizeLanguage(window.localStorage.getItem("batak-site-language"));
    } catch (_) {
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem("batak-site-language", language);
    } catch (_) {
      // The URL parameter still preserves the selection if storage is unavailable.
    }
  }

  function resolveLanguage() {
    const queryLanguage = normalizeLanguage(new URLSearchParams(window.location.search).get("lang"));
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

  function languageUrl(sourceUrl, language) {
    const url = new URL(sourceUrl, window.location.href);
    if (language === "tr") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", language);
    }
    return url;
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

    const pageUrl = languageUrl(window.location.href, language);
    pageUrl.hash = "";
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl.href;
    setMeta('meta[property="og:url"]', pageUrl.href);

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
    for (const alternateLanguage of supportedLanguages) {
      const alternate = document.createElement("link");
      alternate.rel = "alternate";
      alternate.hreflang = alternateLanguage;
      const alternateUrl = languageUrl(pageUrl.href, alternateLanguage);
      alternate.href = alternateUrl.href;
      document.head.appendChild(alternate);
    }
    const fallback = document.createElement("link");
    fallback.rel = "alternate";
    fallback.hreflang = "x-default";
    fallback.href = languageUrl(pageUrl.href, "tr").href;
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

  function applyPageCopy(pageCopy) {
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
    document.querySelectorAll("[data-copy-html]").forEach((element) => {
      const value = copy[element.dataset.copyHtml];
      if (value) element.innerHTML = value;
    });
    document.querySelectorAll("[data-copy-alt]").forEach((element) => {
      const value = copy[element.dataset.copyAlt];
      if (value) element.setAttribute("alt", value);
    });
    document.querySelectorAll("[data-copy-aria]").forEach((element) => {
      const value = copy[element.dataset.copyAria];
      if (value) element.setAttribute("aria-label", value);
    });
  }

  function applyLocalizedScreens(language) {
    const screenRoot = language === "tr" ? "./assets/screens" : `./assets/screens/${language}`;
    document.querySelectorAll("[data-localized-screen]").forEach((image) => {
      const screenName = image.dataset.localizedScreen;
      if (!/^[a-z0-9-]+$/.test(screenName || "")) return;
      image.src = `${screenRoot}/${screenName}.webp`;
      image.srcset = `${screenRoot}/450/${screenName}.webp 450w, ${screenRoot}/${screenName}.webp 900w`;
    });
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

    for (const optionLanguage of supportedLanguages) {
      const option = document.createElement("option");
      option.value = optionLanguage;
      option.textContent = languageLabels[optionLanguage];
      option.selected = optionLanguage === language;
      select.appendChild(option);
    }
    select.addEventListener("change", () => {
      const selectedLanguage = normalizeLanguage(select.value);
      if (!selectedLanguage) return;
      storeLanguage(selectedLanguage);
      const target = languageUrl(window.location.href, selectedLanguage);
      window.location.assign(`${target.pathname}${target.search}${target.hash}`);
    });
    label.append(hiddenLabel, select);
    header.appendChild(label);
  }

  function localizeInternalLinks(language) {
    document.querySelectorAll("a[href]").forEach((link) => {
      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#")) return;
      let url;
      try {
        url = new URL(rawHref, window.location.href);
      } catch (_) {
        return;
      }
      if (url.origin !== window.location.origin || !url.pathname.includes("/batakonline/")) return;
      const localized = languageUrl(url.href, language);
      link.href = `${localized.pathname}${localized.search}${localized.hash}`;
    });
  }

  const language = resolveLanguage();
  const pageCopy = pageTranslations[language] || pageTranslations.tr || {};
  document.documentElement.lang = language;
  document.documentElement.dataset.language = language;
  applyMetadata(language, pageCopy);
  applyCommonCopy(language);
  applyPageCopy(pageCopy);
  applyLocalizedScreens(language);
  addLanguagePicker(language);
  localizeInternalLinks(language);
})();
