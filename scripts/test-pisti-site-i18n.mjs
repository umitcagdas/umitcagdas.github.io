import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const coreLanguages = ["tr", "en", "de", "el", "sq"];
const marketingLanguages = ["tr", "en", "de", "fr", "nl", "es", "it", "el", "sq"];
const localizedScreenNames = ["gameplay", "main-menu", "leaderboard"];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadTranslations(relativePath) {
  const context = { window: {} };
  vm.runInNewContext(read(relativePath), context, { filename: relativePath });
  return context.window.PistiPageI18n;
}

const pages = [
  {
    html: "pistionline/index.html",
    script: "pistionline/assets/i18n-home.js",
    blocks: ["hero", "features", "screens", "info", "developer"],
    languages: marketingLanguages,
  },
  {
    html: "pistionline/support.html",
    script: "pistionline/assets/i18n-support.js",
    blocks: [
      "hero",
      "start",
      "login",
      "matchmaking",
      "connection",
      "reward",
      "profile",
      "deletion",
      "privacy",
      "contact",
    ],
    languages: coreLanguages,
  },
  {
    html: "pistionline/privacy.html",
    script: "pistionline/assets/i18n-privacy.js",
    blocks: [
      "hero",
      "summary",
      "controller",
      "categories",
      "purposes",
      "thirdParties",
      "retention",
      "rights",
      "children",
      "security",
      "contact",
    ],
    languages: coreLanguages,
  },
  {
    html: "pistionline/account-deletion.html",
    script: "pistionline/assets/i18n-account-deletion.js",
    blocks: [
      "hero",
      "steps",
      "deleted",
      "firebase",
      "retained",
      "external",
      "guest",
      "help",
    ],
    languages: coreLanguages,
  },
];

for (const page of pages) {
  const html = read(page.html);
  const translations = loadTranslations(page.script);
  assert.deepEqual(
    [...Object.keys(translations)].sort(),
    [...page.languages].sort(),
    `${page.script}: locales`,
  );
  assert.match(html, /site-i18n\.js/, `${page.html}: shared i18n engine`);
  assert.match(html, /data-page=/, `${page.html}: page identifier`);

  const htmlBlockKeys = [...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(htmlBlockKeys, page.blocks, `${page.html}: block contract`);

  for (const language of page.languages) {
    assert.ok(translations[language].meta?.title, `${page.script}: ${language} title`);
    assert.ok(
      translations[language].meta?.description,
      `${page.script}: ${language} description`,
    );
    if (language === "tr") continue;
    for (const block of page.blocks) {
      assert.ok(
        translations[language].blocks?.[block]?.trim(),
        `${page.script}: ${language}.${block}`,
      );
    }
  }
}

for (const htmlPath of [...pages.map((page) => page.html), "pistionline/updates/index.html"]) {
  const html = read(htmlPath);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|#|data:)/.test(reference)) continue;
    const cleanReference = reference.split(/[?#]/, 1)[0];
    if (!cleanReference) continue;
    let resolved = path.resolve(path.dirname(path.join(root, htmlPath)), cleanReference);
    if (cleanReference.endsWith("/")) resolved = path.join(resolved, "index.html");
    assert.ok(fs.existsSync(resolved), `${htmlPath}: missing ${reference}`);
  }
}

for (const language of marketingLanguages) {
  for (const screenName of localizedScreenNames) {
    const screenPath = path.join(
      root,
      "pistionline/assets/screens",
      language,
      `${screenName}.webp`,
    );
    assert.ok(fs.existsSync(screenPath), `localized screen: missing ${language}/${screenName}`);
    assert.ok(
      fs.statSync(screenPath).size > 50_000,
      `localized screen: unexpectedly small ${language}/${screenName}`,
    );
  }
}

const updatesHtml = read("pistionline/updates/index.html");
const updates = loadTranslations("pistionline/assets/updates.js");
for (const htmlPath of pages.map((page) => page.html)) {
  assert.doesNotMatch(
    read(htmlPath),
    /href="\.\/updates\/"/,
    `${htmlPath}: updates link must name index.html for file previews`,
  );
}
assert.doesNotMatch(
  updatesHtml,
  /href="(?:\.\/|\.\.\/)"/,
  "updates: local navigation must name index.html for file previews",
);
assert.deepEqual(
  [...Object.keys(updates)].sort(),
  [...marketingLanguages].sort(),
  "updates locales",
);
assert.match(updatesHtml, /site-i18n\.js/, "updates shared i18n engine");
assert.deepEqual(
  [...updatesHtml.matchAll(/data-language-panel="([^"]+)"/g)].map(
    (match) => match[1],
  ),
  ["tr", "en", "de", "el", "sq", "fr", "nl", "es", "it"],
  "updates language panels",
);
assert.deepEqual(
  [...updatesHtml.matchAll(/release-card release-card-latest[\s\S]*?<p class="release-version">([^<]+)<\/p>/g)].map(
    (match) => match[1],
  ),
  [
    "Sürüm 1.1.7",
    "Version 1.1.7",
    "Version 1.1.7",
    "Έκδοση 1.1.7",
    "Versioni 1.1.7",
    "Version 1.1.7",
    "Versie 1.1.7",
    "Versión 1.1.7",
    "Versione 1.1.7",
  ],
  "updates latest release per locale",
);
assert.match(updatesHtml, /Pişti: Online 1\.1\.7/, "updates footer version");
for (const language of marketingLanguages) {
  assert.ok(updates[language].meta?.title, `updates: ${language} title`);
  for (const key of [
    "home",
    "updates",
    "support",
    "privacy",
    "eyebrow",
    "title",
    "intro",
    "appStore",
    "marketingSite",
  ]) {
    assert.ok(updates[language].copy?.[key], `updates: ${language}.${key}`);
  }
}

const core = read("pistionline/assets/site-i18n.js");
for (const language of marketingLanguages) {
  assert.match(core, new RegExp(`\\b${language}: \\{`), `core: ${language}`);
}
assert.doesNotMatch(core, /innerHTML\s*=\s*[^;]*(location|searchParams)/);

function runCore({ query = "", storedLanguage = null, browserLanguages = [] }) {
  const stored = new Map();
  if (storedLanguage) stored.set("pisti-site-language", storedLanguage);
  const appendedHeadNodes = [];
  const screenImages = localizedScreenNames.map(() => {
    const attributes = new Map();
    let errorListener = null;
    return {
      addEventListener(type, listener) {
        if (type === "error") errorListener = listener;
      },
      getAttribute: (name) => attributes.get(name) || null,
      setAttribute: (name, value) => attributes.set(name, value),
      emitError() {
        const listener = errorListener;
        errorListener = null;
        if (listener) listener();
      },
    };
  });
  const document = {
    title: "",
    documentElement: { lang: "tr", dataset: {} },
    head: { appendChild: (node) => appendedHeadNodes.push(node) },
    querySelector: () => null,
    querySelectorAll: (selector) =>
      selector === '[data-i18n-html="screens"] .screen-card img'
        ? screenImages
        : [],
    createElement: () => ({
      setAttribute(name, value) {
        this[name] = value;
      },
    }),
  };
  const context = {
    URL,
    URLSearchParams,
    document,
    navigator: { language: browserLanguages[0] || "", languages: browserLanguages },
    window: {
      PistiPageI18n: loadTranslations("pistionline/assets/i18n-home.js"),
      location: {
        href: `https://umitcagdas.github.io/pistionline/${query}`,
        origin: "https://umitcagdas.github.io",
        search: query,
        assign() {},
      },
      localStorage: {
        getItem: (key) => stored.get(key) || null,
        setItem: (key, value) => stored.set(key, value),
      },
    },
  };
  vm.runInNewContext(core, context, { filename: "site-i18n.js" });
  return { document, stored, appendedHeadNodes, screenImages };
}

assert.equal(runCore({ query: "?lang=en" }).document.documentElement.lang, "en");
assert.equal(
  runCore({ storedLanguage: "de", browserLanguages: ["el-GR"] }).document
    .documentElement.lang,
  "de",
);
assert.equal(
  runCore({ browserLanguages: ["fr-FR", "el-GR"] }).document.documentElement.lang,
  "fr",
);
assert.equal(
  runCore({ query: "?lang=%3Cscript%3E", browserLanguages: ["fr-FR"] }).document
    .documentElement.lang,
  "fr",
);

const italianRun = runCore({ query: "?lang=it" });
assert.deepEqual(
  italianRun.screenImages.map((image) => image.getAttribute("src")),
  localizedScreenNames.map(
    (screenName) => `./assets/screens/it/${screenName}.webp`,
  ),
  "localized Italian screen sources",
);
italianRun.screenImages[0].emitError();
assert.equal(
  italianRun.screenImages[0].getAttribute("src"),
  "./assets/gameplay.webp",
  "localized screen fallback",
);

console.log("Pisti site i18n contract passed for nine marketing locales and five pages.");
