(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.start(root);
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const stores = Object.freeze({
    ios: 'https://apps.apple.com/app/id6785009534',
    android: 'https://play.google.com/store/apps/details?id=com.umitcagdas.pistionline'
  });
  const measurementId = 'G-LCNEMHF3S6';
  const consentKey = 'pisti-download-measurement';
  const disableKey = 'ga-disable-' + measurementId;
  const cookiePath = '/pistionline/indir/';
  const campaignKeys = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content',
    'utm_source_platform', 'utm_creative_format', 'utm_marketing_tactic',
    'gclid', 'gbraid', 'wbraid', 'dclid', 'gad_source', 'gad_campaignid', 'gad'
  ];
  const consentDefaults = {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
  };

  function detectPlatform(device) {
    const ua = device.userAgent || '';
    if (/android/i.test(ua)) return 'android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if (/Mac/i.test(device.platform || '') && Number(device.maxTouchPoints) > 1) return 'ios';
    return null;
  }

  function destination(device, query) {
    const params = new URLSearchParams(query || '');
    if (params.get('manual') === '1') return null;
    const requested = params.get('store');
    const platform = Object.prototype.hasOwnProperty.call(stores, requested)
      ? requested
      : detectPlatform(device);
    return platform ? stores[platform] : null;
  }

  function measurementLocation(href) {
    const url = new URL(href);
    for (const key of new Set(url.searchParams.keys())) {
      if (!campaignKeys.includes(key)) url.searchParams.delete(key);
    }
    url.hash = '';
    return url.href;
  }

  function recordPageView(browser, navigate) {
    browser[disableKey] = false;
    browser.dataLayer = browser.dataLayer || [];
    browser.gtag = function () { browser.dataLayer.push(arguments); };
    const tag = browser.gtag;
    const pageLocation = measurementLocation(browser.location.href);
    tag('consent', 'default', consentDefaults);
    tag('consent', 'update', { analytics_storage: 'granted' });
    tag('js', new Date());
    tag('config', measurementId, {
      send_page_view: false,
      page_location: pageLocation,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: 'none',
      cookie_path: cookiePath,
      cookie_expires: 90 * 24 * 60 * 60,
      cookie_update: false
    });

    const event = { send_to: measurementId, page_location: pageLocation };
    const script = browser.document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    if (navigate) {
      let pending = true;
      const deadline = browser.setTimeout(finish, 900);
      function finish() {
        if (!pending) return;
        pending = false;
        browser.clearTimeout(deadline);
        navigate();
      }
      event.event_callback = finish;
      event.event_timeout = 800;
      script.onerror = finish;
    }
    tag('event', 'page_view', event);
    browser.document.head.appendChild(script);
  }

  function stopMeasurement(browser) {
    browser[disableKey] = true;
    if (browser.gtag) browser.gtag('consent', 'update', { analytics_storage: 'denied' });
    for (const name of ['_ga', '_ga_' + measurementId.slice(2)]) {
      browser.document.cookie = name + '=; Max-Age=0; Path=' + cookiePath + '; Secure; SameSite=Lax';
    }
  }

  function start(browser) {
    const document = browser.document;
    const target = destination(browser.navigator, browser.location.search);
    const status = document.getElementById('device-status');
    const navigate = target ? function () {
      if (status) status.textContent = target === stores.ios
        ? 'App Store açılıyor. Açılmazsa aşağıdaki bağlantıya dokunabilirsin.'
        : 'Google Play açılıyor. Açılmazsa aşağıdaki bağlantıya dokunabilirsin.';
      browser.location.replace(target);
    } : null;
    const panel = document.getElementById('measurement-options');
    const allow = document.getElementById('measurement-allow');
    const decline = document.getElementById('measurement-decline');
    const preferences = document.getElementById('measurement-preferences');
    if (!panel || !allow || !decline || !preferences) {
      if (navigate) navigate();
      return;
    }

    let choice;
    try { choice = browser.localStorage.getItem(consentKey); } catch (_) { /* Storage can be blocked. */ }
    let measured = false;
    function showOptions(show) {
      panel.hidden = !show;
      preferences.setAttribute('aria-expanded', String(show));
    }

    preferences.hidden = false;
    preferences.addEventListener('click', function () {
      showOptions(panel.hidden);
      if (!panel.hidden) allow.focus();
    });
    function applyChoice(nextChoice) {
      showOptions(false);
      if (nextChoice === 'allowed') {
        if (!measured) {
          measured = true;
          recordPageView(browser, navigate);
        } else {
          browser[disableKey] = false;
          browser.gtag('consent', 'update', { analytics_storage: 'granted' });
          if (navigate) navigate();
        }
      } else {
        stopMeasurement(browser);
        if (navigate) navigate();
      }
    }

    for (const [button, value] of [[allow, 'allowed'], [decline, 'declined']]) {
      button.addEventListener('click', function () {
        try { browser.localStorage.setItem(consentKey, value); } catch (_) { /* Honor this visit's choice. */ }
        applyChoice(value);
        if (!navigate) preferences.focus();
      });
    }

    if (choice === 'allowed' || choice === 'declined') {
      applyChoice(choice);
      return;
    }
    if (navigate) navigate();
  }

  return Object.freeze({ stores: stores, detectPlatform: detectPlatform, destination: destination, start: start });
});
