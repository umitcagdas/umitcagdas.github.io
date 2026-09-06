import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const languages = ["tr", "en", "de", "el", "es", "fr", "it", "nl"];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadTranslations(relativePath) {
  const context = { window: {} };
  vm.runInNewContext(read(relativePath), context, { filename: relativePath });
  return context.window.BatakPageI18n;
}

const pages = [
  { html: "batakonline/index.html", script: "batakonline/assets/i18n-home.js", contract: "copy" },
  { html: "batakonline/support.html", script: "batakonline/assets/i18n-support.js", contract: "blocks" },
  { html: "batakonline/privacy.html", script: "batakonline/assets/i18n-privacy.js", contract: "blocks" },
  { html: "batakonline/account-deletion.html", script: "batakonline/assets/i18n-account-deletion.js", contract: "blocks" },
];

for (const page of pages) {
  const html = read(page.html);
  const translations = loadTranslations(page.script);
  assert.deepEqual([...Object.keys(translations)].sort(), [...languages].sort(), `${page.script}: locales`);
  assert.match(html, /site-i18n\.js/, `${page.html}: shared i18n engine`);
  assert.match(html, /data-page=/, `${page.html}: page identifier`);

  const keyPattern = page.contract === "copy"
    ? /data-copy(?:-alt|-aria|-html)?="([^"]+)"/g
    : /data-i18n-html="([^"]+)"/g;
  const keys = [...html.matchAll(keyPattern)].map((match) => match[1]);
  assert.ok(keys.length > 0, `${page.html}: translation contract is empty`);

  for (const language of languages) {
    assert.ok(translations[language].meta?.title, `${page.script}: ${language} title`);
    assert.ok(translations[language].meta?.description, `${page.script}: ${language} description`);
    if (language === "tr") continue;
    for (const key of keys) {
      assert.ok(translations[language][page.contract]?.[key]?.trim(), `${page.script}: ${language}.${key}`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|#|data:)/.test(reference)) continue;
    const cleanReference = reference.split(/[?#]/, 1)[0];
    if (!cleanReference) continue;
    let resolved = path.resolve(path.dirname(path.join(root, page.html)), cleanReference);
    if (cleanReference.endsWith("/")) resolved = path.join(resolved, "index.html");
    assert.ok(fs.existsSync(resolved), `${page.html}: missing ${reference}`);
  }
}

const home = read("batakonline/index.html");
const responsiveScreens = [...home.matchAll(/<img[^>]+srcset="([^"]+)"/g)];
assert.equal(responsiveScreens.length, 7, "home: seven responsive screenshots");
assert.match(read("batakonline/assets/site.css"), /aspect-ratio:\s*110\s*\/\s*239/, "screens preserve source ratio");

const core = read("batakonline/assets/site-i18n.js");
for (const language of languages) {
  assert.match(core, new RegExp(`\\b${language}: \\{`), `core: ${language}`);
}
assert.doesNotMatch(core, /innerHTML\s*=\s*[^;]*(location|searchParams)/);

function runCore({ query = "", storedLanguage = null, browserLanguages = [] }) {
  const stored = new Map();
  if (storedLanguage) stored.set("batak-site-language", storedLanguage);
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
      BatakPageI18n: loadTranslations("batakonline/assets/i18n-home.js"),
      location: {
        href: `https://umitcagdas.github.io/batakonline/${query}`,
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

assert.equal(runCore({ query: "?lang=fr" }).document.documentElement.lang, "fr");
assert.equal(runCore({ storedLanguage: "de", browserLanguages: ["el-GR"] }).document.documentElement.lang, "de");
assert.equal(runCore({ browserLanguages: ["nl-NL", "en-US"] }).document.documentElement.lang, "nl");
assert.equal(runCore({ query: "?lang=%3Cscript%3E", browserLanguages: ["es-ES"] }).document.documentElement.lang, "es");

console.log("Batak site i18n contract passed for eight locales and four pages.");
