const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  let contactModule;
  let contactReady = false;

  const loadContactModule = () => {
    contactModule ??= import("./contact.js").then((module) => {
      contactReady = true;
      return module;
    });
    return contactModule;
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void loadContactModule();
        }
      },
      { rootMargin: "800px 0px" },
    );

    observer.observe(contactForm);
  } else {
    void loadContactModule();
  }

  contactForm.addEventListener("focusin", loadContactModule, { once: true });
  contactForm.addEventListener("pointerenter", loadContactModule, { once: true });

  contactForm.addEventListener(
    "submit",
    async (event) => {
      if (!contactReady) {
        event.preventDefault();
        await loadContactModule();
        contactForm.requestSubmit();
      }
    },
    { capture: true },
  );
}
