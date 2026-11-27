import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = (file) => readFileSync(new URL("../pistionline/" + file, import.meta.url), "utf8");
const redirectScript = read("assets/canonical-navigation.js");
const downloadScript = read("assets/download-routing.js");

function visit(file, url, userAgent = "") {
  const html = read(file);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
  const location = new URL(url);
  const redirects = [];
  const measurements = [];
  const listeners = [];
  location.replace = (destination) => redirects.push(destination);
  const document = {
    querySelector: () => ({ href: canonical }),
    getElementById: () => null,
    querySelectorAll: () => [{
      dataset: { googleAdsStore: "app-store" },
      addEventListener: (event, listener) => listeners.push(listener),
    }],
  };
  const window = {
    location, document, navigator: { userAgent },
    fetch: (href) => { measurements.push(href); return Promise.resolve(); },
  };
  const context = { window, document, URL, URLSearchParams };
  assert.match(html, /<script src="\.\.?\/assets\/canonical-navigation\.js"><\/script>/);
  vm.runInNewContext(redirectScript, context);
  if (file === "indir/index.html") vm.runInNewContext(downloadScript, context);
  for (const listener of listeners) listener();
  return { redirects, measurements };
}

const canonicalOrigin = "https://pisti.umitcagdas.com";
const pages = {
  "index.html": "/",
  "updates/index.html": "/updates/",
  "indir/index.html": "/indir/",
  "privacy.html": "/privacy",
  "support.html": "/support",
  "account-deletion.html": "/account-deletion",
  "pisti-nasil-oynanir.html": "/pisti-nasil-oynanir.html",
  "arkadaslarla-pisti.html": "/arkadaslarla-pisti.html",
};
const query = "?lang=el&manual=1&utm_source=qr#masa";
for (const [file, canonicalPath] of Object.entries(pages)) {
  const oldPath = "/pistionline/" + file.replace(/index\.html$/, "");
  for (const host of ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"]) {
    const result = visit(file, "https://" + host + oldPath + query);
    assert.deepEqual(result.redirects, [canonicalOrigin + canonicalPath + query], host + oldPath);
  }
  for (const url of [canonicalOrigin + canonicalPath, "http://localhost:8000" + oldPath, "file:///tmp" + oldPath]) {
    assert.deepEqual(visit(file, url + query).redirects, [], url);
  }
  assert.doesNotMatch(read(file), /https:\/\/umitcagdas\.github\.io\/pistionline\//);
}
assert.deepEqual(visit("index.html", "https://umitcagdas.com/projeler/").redirects, []);
const campaign = "?manual=1&gad_campaignid=24498275745&gclid=example";
assert.deepEqual(visit("indir/index.html", "https://umitcagdas.com/pistionline/indir/" + campaign, "iPhone"), {
  redirects: [],
  measurements: ["https://umitcagdas.com/pistionline/indir/store-click.html?campaign_id=24498275745&store=app-store"],
});
assert.deepEqual(visit("indir/index.html", "https://umitcagdas.github.io/pistionline/indir/?store=ios", "iPhone").redirects,
  [canonicalOrigin + "/indir/?store=ios"]);
assert.deepEqual(visit("indir/index.html", canonicalOrigin + "/indir/?store=ios", "iPhone").redirects,
  ["https://apps.apple.com/app/id6785009534"]);
assert.deepEqual(visit("indir/index.html", canonicalOrigin + "/indir/", "Android").redirects,
  ["https://play.google.com/store/apps/details?id=com.umitcagdas.pistionline"]);
assert.doesNotMatch(read("indir/store-click.html"), /canonical-navigation/);
for (const file of ["support.html", "assets/i18n-support.js"]) {
  assert.match(read(file), /https:\/\/pisti\.umitcagdas\.com\/api\/health/);
  assert.doesNotMatch(read(file), /pisti\.kobitron\.com/);
}
console.log("Pişti canonical links, eight legacy pages, campaign clicks, and store routing passed.");
