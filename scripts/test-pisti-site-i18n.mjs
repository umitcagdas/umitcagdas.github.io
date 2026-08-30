import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["tr", "en", "de", "el", "sq"];

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
  },
];

for (const page of pages) {
  const html = read(page.html);
  const translations = loadTranslations(page.script);
  assert.deepEqual(Object.keys(translations), languages, `${page.script}: locales`);
  assert.match(html, /site-i18n\.js/, `${page.html}: shared i18n engine`);
  assert.match(html, /data-page=/, `${page.html}: page identifier`);

  const htmlBlockKeys = [...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(htmlBlockKeys, page.blocks, `${page.html}: block contract`);

  for (const language of languages) {
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

const updatesHtml = read("pistionline/updates/index.html");
const updates = loadTranslations("pistionline/assets/updates.js");
assert.deepEqual(Object.keys(updates), languages, "updates locales");
assert.match(updatesHtml, /site-i18n\.js/, "updates shared i18n engine");
assert.deepEqual(
  [...updatesHtml.matchAll(/data-language-panel="([^"]+)"/g)].map(
    (match) => match[1],
  ),
  languages,
  "updates language panels",
);
for (const language of languages) {
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
for (const language of languages) {
  assert.match(core, new RegExp(`\\b${language}: \\{`), `core: ${language}`);
}
assert.doesNotMatch(core, /innerHTML\s*=\s*[^;]*(location|searchParams)/);

function runCore({ query = "", storedLanguage = null, browserLanguages = [] }) {
  const stored = new Map();
  if (storedLanguage) stored.set("pisti-site-language", storedLanguage);
  const appendedHeadNodes = [];
  const document = {
    title: "",
    documentElement: { lang: "tr", dataset: {} },
    head: { appendChild: (node) => appendedHeadNodes.push(node) },
    querySelector: () => null,
    querySelectorAll: () => [],
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
  return { document, stored, appendedHeadNodes };
}

assert.equal(runCore({ query: "?lang=en" }).document.documentElement.lang, "en");
assert.equal(
  runCore({ storedLanguage: "de", browserLanguages: ["el-GR"] }).document
    .documentElement.lang,
  "de",
);
assert.equal(
  runCore({ browserLanguages: ["fr-FR", "el-GR"] }).document.documentElement.lang,
  "el",
);
assert.equal(
  runCore({ query: "?lang=%3Cscript%3E", browserLanguages: ["fr-FR"] }).document
    .documentElement.lang,
  "tr",
);

console.log("Pisti site i18n contract passed for 5 locales and 5 pages.");
