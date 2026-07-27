const userAgent = navigator.userAgent.toLowerCase();
const isMobile =
  /android|iphone|ipad|ipod|mobile/.test(userAgent) ||
  (navigator.maxTouchPoints > 1 && /macintosh/.test(userAgent));
const isWindows = /windows/.test(userAgent);
const isMac = /macintosh|mac os x/.test(userAgent) && !isMobile;

const detectedDownload = document.querySelector("#detected-download");
const detectedPlatform = document.querySelector("#detected-platform");
const primaryDownload = document.querySelector("#primary-download");
const platformMessage = document.querySelector("#platform-message");
const mobileHandoff = document.querySelector("#mobile-handoff");
const shareButton = document.querySelector("#share-link");
const copyButton = document.querySelector("#copy-link");
const copyStatus = document.querySelector("#copy-status");

const downloads = {
  mac: {
    label: "macOS algılandı",
    button: "Mac için indir",
    href: "./downloads/Remotiq_0.1.0_aarch64.dmg",
  },
  windows: {
    label: "Windows algılandı",
    button: "Windows için indir",
    href: "./downloads/Remotiq_0.1.0_x64-setup.exe",
  },
};

function showDetectedDownload(platform) {
  const download = downloads[platform];
  detectedPlatform.textContent = download.label;
  primaryDownload.textContent = download.button;
  primaryDownload.href = download.href;
  detectedDownload.hidden = false;
}

async function copyPageLink() {
  const pageUrl = window.location.href.split("#")[0];
  try {
    await navigator.clipboard.writeText(pageUrl);
  } catch {
    const input = document.createElement("textarea");
    input.value = pageUrl;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  copyStatus.textContent = "Bağlantı kopyalandı.";
}

if (isMobile) {
  document.body.classList.add("is-mobile");
  mobileHandoff.hidden = false;
  platformMessage.textContent =
    "Telefonunuzdasınız. Bu sayfayı bilgisayarınıza gönderin; açıldığında doğru indirme seçeneğini öne çıkaracağız.";
} else if (isMac) {
  showDetectedDownload("mac");
} else if (isWindows) {
  showDetectedDownload("windows");
}

shareButton?.addEventListener("click", async () => {
  const pageUrl = window.location.href.split("#")[0];
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Remotiq Desktop",
        text: "Remotiq bilgisayar uygulamasını indirin.",
        url: pageUrl,
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }
  await copyPageLink();
});

copyButton?.addEventListener("click", copyPageLink);
