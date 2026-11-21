(function (browser) {
  'use strict';

  const url = new URL(browser.location.href);
  const params = url.searchParams;
  const isTurkish = (params.get('lang') || 'tr').toLowerCase().split('-')[0] === 'tr';
  const page = browser.document;

  if (!isTurkish) {
    page.documentElement.lang = 'en';
    for (const element of page.querySelectorAll('[data-en]')) {
      element.textContent = element.dataset.en;
    }
    for (const link of page.querySelectorAll('a[data-keep-language]')) {
      const target = new URL(link.href);
      target.searchParams.set('lang', 'en');
      link.href = target.href;
    }
  }

  const storeLink = page.getElementById('app-store-link');
  if (!storeLink || url.hostname !== 'pisyedili.umitcagdas.com') return;

  function trafficSource() {
    const source = (params.get('utm_source') || '').toLowerCase();
    if (['gclid', 'gbraid', 'wbraid', 'gad_campaignid'].some((key) => params.get(key)) ||
        ['google', 'google_ads', 'googleads'].includes(source)) {
      return 'google';
    }
    if (params.get('fbclid') || ['facebook', 'instagram', 'meta', 'fb', 'ig'].includes(source)) {
      return 'meta';
    }
    return 'untagged';
  }

  const measurement = new URL('store-click.html', url);
  measurement.searchParams.set('source', trafficSource());

  function record(mode) {
    if (typeof browser.fetch !== 'function') return;
    measurement.searchParams.set('mode', mode);
    browser.fetch(measurement.href, {
      keepalive: true,
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer'
    }).catch(() => {});
  }

  storeLink.addEventListener('click', () => record('manual'), { once: true });

  const device = browser.navigator;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(device.userAgent) ||
    (/Mac/i.test(device.platform || '') && Number(device.maxTouchPoints) > 1);

  if (isAppleMobile && params.get('manual') !== '1') {
    const status = page.getElementById('device-status');
    if (status) {
      status.textContent = isTurkish
        ? 'App Store açılıyor. Açılmazsa aşağıdaki düğmeye dokun.'
        : 'Opening the App Store. If it does not open, tap the button below.';
    }
    record('auto');
    browser.location.replace(storeLink.href);
  }
})(window);
