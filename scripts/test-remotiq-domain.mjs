import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { localeOrder } from "./remotiq-locales.mjs";

const repo = fileURLToPath(new URL("../", import.meta.url));
const origin = "https://remotiq.umitcagdas.com";
const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
const read = (file) => readFileSync(path.join(repo, file), "utf8");
const script = read("Remotiq/assets/site.js");
const sitemap = new Set([...read("Remotiq/sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]));
const queryHash = "?utm_source=qr&ref=mobile%20app#setup";

function checkVisit(href, canonical, locale, preferred, manuallyChosen) {
  const location = new URL(href);
  const redirects = [];
  location.replace = (value) => redirects.push(value);
  location.assign = (value) => redirects.push(value);
  let listener;
  const chosen = { lang: "pt-BR", value: origin + "/pt-BR/support.html" };
  const picker = { selectedOptions: [chosen], addEventListener: (_, callback) => { listener = callback; } };
  const storage = new Map(manuallyChosen ? [["remotiq.siteLocale", locale]] : []);
  const session = new Map();
  const fakeStorage = (data) => ({ getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) });
  const document = {
    body: { dataset: { siteLocale: locale } },
    querySelector(selector) {
      if (selector === 'link[rel="canonical"]') return { href: canonical };
      if (selector === "[data-language-picker]") return picker;
      if (selector === 'link[rel="alternate"][hreflang="zh-Hans"]') return { href: origin + "/zh-Hans/support.html" };
    },
  };
  vm.runInNewContext(script, { URL, document, location, navigator: { language: preferred }, localStorage: fakeStorage(storage), sessionStorage: fakeStorage(session) });
  return { redirects, storage, change: () => listener() };
}

for (const locale of localeOrder) {
  const base = locale === "tr" ? "/" : "/" + locale + "/";
  for (const [file, pathSuffix] of [["index.html", ""], ["get/index.html", "get/"], ["privacy.html", "privacy.html"], ["support.html", "support.html"]]) {
    const html = read("Remotiq" + base + file);
    const canonical = origin + base + pathSuffix;
    assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'));
    assert.ok(html.includes('property="og:url" content="' + canonical + '"'));
    assert.equal((html.match(/rel="alternate" hreflang="(?!x-default)/g) || []).length, localeOrder.length);
    assert.ok(sitemap.delete(canonical), canonical + " must appear once in the product sitemap");
    assert.doesNotMatch(html, /umitcagdas\.github\.io\/Remotiq\//);
    for (const match of html.matchAll(/(?:href|src)="(https:\/\/remotiq\.umitcagdas\.com\/[^"]*)"/g)) {
      const target = new URL(match[1]).pathname;
      assert.ok(existsSync(path.join(repo, "Remotiq", target, target.endsWith("/") ? "index.html" : "")), match[1]);
    }
    for (const host of legacyHosts) {
      assert.deepEqual(checkVisit("https://" + host + "/Remotiq" + base + file + queryHash, canonical, locale).redirects, [canonical + queryHash]);
    }
    assert.deepEqual(checkVisit(canonical + queryHash, canonical, locale, "tr").redirects, []);
  }
  const alias = read("Remotiq" + base + "get.html");
  const target = origin + base + "get/";
  assert.ok(alias.includes('<link rel="canonical" href="' + target + '">'));
  const location = new URL("https://umitcagdas.github.io/Remotiq" + base + "get.html" + queryHash);
  let redirect;
  location.replace = (url) => { redirect = url; };
  vm.runInNewContext(alias.match(/<script>(.*?)<\/script>/)[1], { location });
  assert.equal(redirect, target + queryHash);
}
assert.equal(sitemap.size, 0);
assert.ok(read("Remotiq/robots.txt").includes(origin + "/sitemap.xml"));
assert.doesNotMatch(read("sitemap.xml"), /github\.io\/Remotiq\//);
for (const file of ["index.html", "projeler/index.html", "hakkimda/index.html"]) {
  assert.ok(read(file).includes('href="' + origin + '/"'));
}
const page = origin + "/support.html";
assert.deepEqual(checkVisit(page + queryHash, page, "tr", "zh-CN").redirects, [origin + "/zh-Hans/support.html" + queryHash]);
const manual = checkVisit(page + queryHash, page, "tr", "en", true);
assert.deepEqual(manual.redirects, []);
manual.change();
assert.deepEqual(manual.redirects, [origin + "/pt-BR/support.html" + queryHash]);
assert.equal(manual.storage.get("remotiq.siteLocale"), "pt-BR");
const fallback = read("404.html").match(/<script>([\s\S]+?)<\/script>/)[1];
for (const [incoming, expected] of [["/remotiq", "/"], ["/remotiq/fr/get/", "/fr/get/"], ["/rEmotiQ/ja/privacy.html", "/ja/privacy.html"], ["/remotiq-dev/", null], ["/projeler/", null]]) {
  const location = new URL("https://umitcagdas.com" + incoming + queryHash);
  let redirect = null;
  location.replace = (url) => { redirect = url; };
  vm.runInNewContext(fallback, { location, URL });
  assert.equal(redirect, expected && origin + expected + queryHash);
}
console.log("Verified 55 Remotiq pages, 44 sitemap URLs, portfolio links and localized legacy redirects.");
