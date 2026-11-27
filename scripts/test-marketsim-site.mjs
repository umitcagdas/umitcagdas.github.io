import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import vm from "node:vm";

const origin = "https://marketsim.umitcagdas.com";
const site = new URL("../mahallemarketi/", import.meta.url);
const read = path => readFileSync(new URL(path, site), "utf8");
const nav = read("assets/navigation.js");
const store = "https://apps.apple.com/app/id6826906067";
const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
const campaign = "?src=store%20listing&c=x%2Fy&c=z#details";
const pageGroups = [["/", "/tr/"], ["/support.html", "/support-tr.html"], ["/privacy.html", "/privacy-tr.html"]];

function simulate(path, href, { languages = ["en-US"], saved, storage = true } = {}) {
  const file = path.endsWith("/") ? path + "index.html" : path;
  const html = read(file.slice(1));
  const location = new URL(href);
  const redirects = [];
  location.replace = url => redirects.push(url);
  const links = [...html.matchAll(/data-language="(en|tr)" href="([^"]+)"/g)].map(([, language, url]) => ({
    href: new URL(url, location).href,
    dataset: { language },
    addEventListener(event, callback) { this[event] = callback; },
  }));
  const context = {
    URL, URLSearchParams, location, navigator: { languages },
    document: {
      documentElement: { lang: /<html lang="(en|tr)">/.exec(html)[1] },
      body: { classList: { contains: name => html.includes('<body class="' + name + '">') } },
      querySelectorAll: () => links,
    },
    localStorage: {
      getItem() { if (!storage) throw new Error("Storage unavailable"); return saved; },
      setItem(_key, value) { if (!storage) throw new Error("Storage unavailable"); saved = value; },
    },
  };
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], context);
  vm.runInNewContext(nav, context);
  return { redirects, links: Object.fromEntries(links.map(link => [link.dataset.language, link])), saved: () => saved };
}

const sitemap = read("sitemap.xml");
assert.deepEqual(new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])),
  new Set(pageGroups.flat().map(path => origin + path)));
assert.equal([...sitemap.matchAll(/<xhtml:link /g)].length, 18);
assert.ok(read("robots.txt").includes("Sitemap: " + origin + "/sitemap.xml"));
for (const pair of pageGroups) {
  for (const [index, path] of pair.entries()) {
    const lang = index ? "tr" : "en";
    const file = (path.endsWith("/") ? path + "index.html" : path).slice(1);
    const html = read(file);
    const canonical = origin + path;
    for (const snippet of [
      '<html lang="' + lang + '">', '<link rel="canonical" href="' + canonical + '">',
      'property="og:url" content="' + canonical + '"', 'name="twitter:image" content="' + origin + '/assets/hero.webp"',
      'hreflang="en" href="' + origin + pair[0] + '"', 'hreflang="tr" href="' + origin + pair[1] + '"',
      'hreflang="x-default" href="' + origin + pair[0] + '"',
    ]) assert.ok(html.includes(snippet), file + " missing " + snippet);
    for (const [, relative] of html.matchAll(/(?:src|href)="((?:\.\.?\/)?assets\/[^"]+)"/g)) {
      assert.ok(statSync(new URL(relative, new URL(file, site))).size, relative);
    }
    if (path.endsWith("/")) {
      assert.ok(html.includes('class="store-button" href="' + store + '"'));
      assert.doesNotMatch(html, /play\.google\.com|Google Play/);
    } else {
      assert.ok(html.includes("mailto:umitcagdas@gmail.com"));
      assert.deepEqual(simulate(path, canonical + campaign, { languages: ["tr"], saved: "tr" }).redirects, []);
    }
    for (const host of legacyHosts) {
      for (const oldPath of path.endsWith("/") ? [path, path + "index.html"] : [path]) {
        assert.deepEqual(simulate(path, "https://" + host + "/mahallemarketi" + oldPath + campaign).redirects, [canonical + campaign]);
      }
    }
    assert.deepEqual(simulate(path, canonical + campaign).redirects, []);
  }
}

assert.deepEqual(simulate("/", origin + "/" + campaign, { languages: ["de", "tr-TR", "en"] }).redirects,
  [origin + "/tr/" + campaign]);
assert.deepEqual(simulate("/", origin + "/", { languages: ["en-GB", "tr"], saved: "tr" }).redirects, [origin + "/tr/"]);
assert.deepEqual(simulate("/", origin + "/", { languages: ["tr"], saved: "en" }).redirects, []);
assert.deepEqual(simulate("/tr/", origin + "/tr/", { saved: "en" }).redirects, []);
const switched = simulate("/tr/", origin + "/tr/" + campaign, { languages: ["tr"] });
assert.equal(switched.links.en.href, origin + "/?src=store%20listing&c=x%2Fy&c=z&lang=en#details");
switched.links.en.click();
assert.equal(switched.saved(), "en");
assert.deepEqual(simulate("/", switched.links.en.href, { languages: ["tr"], storage: false }).redirects, []);
const explicit = simulate("/", origin + "/?src=a%20b&lang=en&c=x%2fy#anchor", { languages: ["tr"] });
assert.equal(explicit.links.tr.href, origin + "/tr/?src=a%20b&lang=tr&c=x%2fy#anchor");
assert.equal(explicit.saved(), "en");
assert.equal(simulate("/tr/", origin + "/tr/?lang=unknown").links.en.href, origin + "/?lang=en");
assert.equal(simulate("/privacy.html", origin + "/privacy.html" + campaign).links.tr.href,
  origin + "/privacy-tr.html" + campaign);
assert.ok(readFileSync(new URL("../projeler/index.html", import.meta.url), "utf8").includes(origin + "/tr/"));
console.log("Verified six Market Sim pages, social metadata, local assets, sitemap, store, legacy redirects and language preferences.");
