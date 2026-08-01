const picker = document.querySelector("[data-language-picker]");
picker?.addEventListener("change", () => {
  localStorage.setItem("remotiq.siteLocale", picker.value.split("/").filter(Boolean)[1] || "tr");
  location.assign(picker.value + location.hash);
});

const supported = ["en", "tr", "de", "es", "fr", "pt-BR", "it", "ja", "ko", "zh-Hans", "id"];
const locale = document.body.dataset.siteLocale;
if (locale === "tr" && !localStorage.getItem("remotiq.siteLocale") && !sessionStorage.getItem("remotiq.languageChecked")) {
  sessionStorage.setItem("remotiq.languageChecked", "1");
  const raw = navigator.languages?.[0] || navigator.language || "tr";
  const preferred = raw.toLowerCase().startsWith("pt") ? "pt-BR" : raw.toLowerCase().startsWith("zh") ? "zh-Hans" : supported.find((x) => raw.toLowerCase().startsWith(x.toLowerCase()));
  if (preferred && preferred !== "tr") {
    const page = document.body.dataset.sitePage;
    const suffix = page === "index" ? "/" : page === "get" ? "/get/" : `/${page}.html`;
    location.replace(`/Remotiq/${preferred}${suffix}${location.hash}`);
  }
}
