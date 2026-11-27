import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const root = "https://paketlegonder.umitcagdas.com";
const locales = ["en", "tr", "de", "fr", "es", "it", "nl", "el", "sq"];
const read = (path) => readFileSync(new URL("../paketle-gonder/" + path, import.meta.url), "utf8");
const script = read("site.js");
const legacyHosts = ["umitcagdas.github.io", "umitcagdas.com", "www.umitcagdas.com"];
const files = { index: "/", support: "/support.html", privacy: "/privacy.html" };
const sitemap = new Set([...read("sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)].map((entry) => entry[1]));
const store = "https://apps.apple.com/app/id6829047820";
const query = "?utm_source=store&lang=tr#tr";

function simulate(href, page, languages = []) {
  const location = new URL(href);
  const replacements = [];
  location.replace = (v) => replacements.push(v);
  const canonical = { href: root + files[page] };
  const article = (lang) => ({ dataset: { lang }, querySelector: () => ({ textContent: lang }) });
  const articles = locales.map(article);
  const languageLinks = locales.map((lang) => ({ lang, setAttribute() {} }));
  const nav = Object.entries({ home: "index.html", support: "support.html", privacy: "privacy.html" }).map(([pageLink, target]) => ({
    dataset: { pageLink }, getAttribute: () => target, querySelector: () => null,
  }));
  const document = {
    body: { dataset: { page } },
    documentElement: { lang: "en" },
    querySelector(sel) {
      if (sel === 'link[rel="canonical"]') return canonical;
      if (sel.startsWith("article[")) return articles.find((el) => sel.includes('"' + el.dataset.lang + '"'));
      return {};
    },
    querySelectorAll(sel) {
      if (sel === "[data-page-link]") return nav;
      return sel === "article[data-lang]" ? articles : languageLinks;
    },
  };
  vm.runInNewContext(script, { URL, location, document, navigator: { languages } });
  return { canonical: canonical.href, replacements, lang: document.documentElement.lang, articles, nav };
}

for (const [page, path] of Object.entries(files)) {
  const html = read(page + ".html");
  const canonical = root + path;
  assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'));
  assert.ok(html.includes('property="og:url" content="' + canonical + '"'));
  assert.ok(html.includes('src="site.js"') && html.includes('data-page="' + page + '"'));
  assert.ok(html.includes('href="godot-license.txt"') && html.includes('href="nunito-license.txt"'));
  for (const old of legacyHosts) {
    assert.deepEqual(simulate("https://" + old + "/paketle-gonder" + path + query, page).replacements, [canonical + query]);
  }
  for (const lang of (page === "privacy" ? ["en"] : locales)) {
    const target = canonical + (lang === "en" ? "" : "?lang=" + lang);
    assert.ok(sitemap.delete(target), target + " missing from sitemap");
    if (page === "privacy") continue;
    assert.ok(html.includes('hreflang="' + lang + '" href="' + target + '"'));
    const v = simulate(canonical + "?lang=" + lang, page, ["de-DE"]);
    assert.equal(v.lang, lang);
    assert.equal(v.canonical, target);
    assert.deepEqual(v.articles.filter((x) => !x.hidden).map((x) => x.dataset.lang), [lang]);
    assert.match(v.nav[2].href, lang === "tr" ? /#tr$/ : /#en$/);
    if (page === "index") {
      const body = html.match(new RegExp('<article data-lang="' + lang + '".*?</article>', "s"))[0];
      assert.ok(body.includes('class="button" href="' + store + '"') && body.includes('class="support-link"'));
      assert.ok(body.includes('screens/' + lang + '.webp') && body.includes("200") && !body.includes("100 packing puzzles"));
    }
  }
}
assert.equal(sitemap.size, 0);
assert.equal(simulate(root + "/", "index", ["tr-TR"]).lang, "tr");
assert.equal(simulate(root + "/", "index", ["xx", "el-GR"]).lang, "el");
assert.equal(simulate(root + "/", "index", ["ja-JP"]).lang, "en");
assert.equal(simulate(root + "/?lang=en", "index", ["tr-TR"]).lang, "en");
assert.equal(simulate(root + "/?lang=unknown", "index", ["tr-TR"]).lang, "en");
assert.equal(simulate(root + "/privacy.html?lang=en#tr", "privacy", ["en"]).nav[0].textContent, "Paketle & Gönder");
assert.equal(simulate(root + "/privacy.html?lang=tr#en", "privacy", ["tr"]).nav[0].textContent, "Pack & Send");
assert.ok(read("privacy.html").includes('id="en"') && read("privacy.html").includes('id="tr"'));
assert.ok(read("privacy.html").includes("www.cloudflare.com/privacypolicy/"));
assert.ok(read("robots.txt").includes(root + "/sitemap.xml"));
assert.ok(readFileSync(new URL("../projeler/index.html", import.meta.url), "utf8").includes(root + "/?lang=tr"));
console.log("Verified nine locales, explicit and browser language selection, two privacy anchors, App Store buttons and all 19 sitemap URLs.");
