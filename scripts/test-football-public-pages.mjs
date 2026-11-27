import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const read = (file) => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
const languages = ["tr", "en", "es", "pt", "de", "fr", "it", "nl", "el", "sq"];
const elevenOrigin = "https://11metre.umitcagdas.com";
const soccerOrigin = "https://supersoccer.umitcagdas.com";
const elevenScript = read("11-metre/legacy-navigation.js");
const queryAndHash = "?campaign=summer%20cup&lang=tr#privacy";
function legacyTarget(script, href, canonical) {
  const location = new URL(href);
  const redirects = [];
  location.replace = (uri) => redirects.push(uri);
  const window = { location };
  const document = { querySelector: () => ({ href: canonical }) };
  vm.runInNewContext(script, { URL, window, location, document });
  return redirects;
}

for (const lang of languages) {
  const languagePath = lang === "tr" ? "/" : "/" + lang + "/";
  for (const file of ["index.html", "privacy.html", "terms.html", "account-deletion.html"]) {
    const html = read("11-metre" + languagePath + file);
    const suffix = file === "index.html" ? "" : file;
    const canonical = elevenOrigin + languagePath + suffix;
    assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'));
    assert.equal((html.match(/rel="alternate" hreflang="(?!x-default)/g) || []).length, languages.length);
    const scriptPath = html.match(/<script defer src="([^"]+)"><\/script>/)[1];
    assert.equal(new URL(scriptPath, canonical).href, elevenOrigin + "/legacy-navigation.js");
    assert.doesNotMatch(html, /onbirmetre\.kobitron\.com|href="\/11-metre\//);
    if (file === "index.html") assert.ok(html.includes(elevenOrigin + "/oyna/?lang=" + lang));
    if (file === "account-deletion.html") assert.ok(html.includes(elevenOrigin + "/hesap-sil?lang=" + lang));
    for (const host of legacyHosts) {
      const old = "https://" + host + "/11-metre" + languagePath + file + queryAndHash;
      assert.deepEqual(legacyTarget(elevenScript, old, canonical), [canonical + queryAndHash]);
    }
    assert.deepEqual(legacyTarget(elevenScript, canonical + queryAndHash, canonical), []);
  }
}
assert.deepEqual(legacyTarget(elevenScript, "https://umitcagdas.com/11-metre", elevenOrigin + "/"), [elevenOrigin + "/"]);
assert.deepEqual(legacyTarget(elevenScript, "https://umitcagdas.com/projeler/", elevenOrigin + "/"), []);
const privacy = read("supersoccer/index.html");
const policyScript = privacy.match(/<script>([\s\S]+?)<\/script>/)[1];
const policy = soccerOrigin + "/privacy/";
assert.ok(privacy.includes('rel="canonical" href="' + policy + '"'));
for (const frag of ["#english", "#turkce"]) {
  assert.ok(privacy.includes('id="' + frag.slice(1) + '"'));
  for (const host of legacyHosts) {
    assert.deepEqual(legacyTarget(policyScript, "https://" + host + "/supersoccer/?utm=game" + frag), [policy + "?utm=game" + frag]);
  }
  assert.deepEqual(legacyTarget(policyScript, policy + frag), []);
}
const home = read("supersoccer/oyun.html");
assert.ok(home.includes('rel="canonical" href="' + soccerOrigin + '/"'));
for (const frag of ["#english", "#turkce"]) assert.ok(home.includes('href="' + policy + frag + '"'));
assert.doesNotMatch(home, /apps\.apple\.com|play\.google\.com/);
for (const art of ["icon.webp", "training-field.webp"]) {
  assert.ok(home.includes("./assets/" + art));
  const asset = readFileSync(new URL("../supersoccer/assets/" + art, import.meta.url));
  assert.equal(asset.toString("ascii", 8, 12), "WEBP");
}
console.log("Verified 40 localized 11 Metre pages plus the Super Soccer landing, legal document and media.");
