import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index", "privacy", "terms", "support", "account-deletion"];
let links = 0;
for (const name of pages) {
  const file = path.join(root, "tavlaonline", name + ".html");
  const html = fs.readFileSync(file, "utf8");
  assert(
    !/\{\{|\bBOT\b|bot(?:lar|ları|larla)?\b|id6785009534|pistionline\/assets|privacy.*example\.com/i.test(
      html,
    ),
    file,
  );
  assert.equal((html.match(/<h1>/g) || []).length, 1, file);
  const script = path.join(
    root,
    "tavlaonline/assets",
    `i18n-${name === "index" ? "home" : name}.js`,
  );
  const c = { window: {} };
  vm.runInNewContext(fs.readFileSync(script, "utf8"), c);
  const data = c.window.TavlaPageI18n;
  assert.deepEqual(Object.keys(data), ["tr", "en"]);
  const blocks = [...html.matchAll(/data-i18n-html="([^"]+)"/g)].map(
    (x) => x[1],
  );
  for (const lang of ["tr", "en"]) {
    assert(data[lang].meta.title && data[lang].meta.description);
    assert.deepEqual(Object.keys(data[lang].blocks), blocks);
    const body = Object.values(data[lang].blocks).join("\n");
    assert(!/\{\{|\bBOT\b|bot(?:lar|ları|larla)?\b/i.test(body));
    for (const [_, link] of (html + "\n" + body).matchAll(
      /(?:href|src)="([^"]+)"/g,
    )) {
      const url = new URL(
        link.replaceAll("&amp;", "&"),
        `https://umitcagdas.github.io/tavlaonline/${name === "index" ? "" : name + ".html"}`,
      );
      if (url.protocol !== "https:" || url.host !== "umitcagdas.github.io")
        continue;
      let target = path.join(root, decodeURIComponent(url.pathname));
      if (url.pathname.endsWith("/")) target = path.join(target, "index.html");
      assert(fs.existsSync(target), `${file}: missing ${link}`);
      if (url.hash && target.endsWith(".html")) {
        const content = fs.readFileSync(target, "utf8");
        assert(
          content.includes(`id="${url.hash.slice(1)}"`),
          `${file}: missing anchor ${link}`,
        );
      }
      links++;
    }
  }
}
for (const page of ["index.html", "projeler/index.html"])
  assert(
    fs.readFileSync(path.join(root, page), "utf8").includes("tavlaonline/"),
  );
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
assert.equal(
  (sitemap.match(/<loc>https:\/\/umitcagdas.github.io\/tavlaonline\//g) || [])
    .length,
  10,
);
console.log(
  `5 pages, 2 languages, ${links} local references and 10 sitemap entries verified.`,
);
