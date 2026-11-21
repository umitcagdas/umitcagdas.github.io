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

  function measureGoogleAdsStoreClicks(browser) {
    const { hostname, href, search } = browser.location;
    if (hostname !== 'umitcagdas.com' || typeof browser.fetch !== 'function') return;
    const params = new URLSearchParams(search);
    const campaignId = params.get('gad_campaignid');
    if (params.get('manual') !== '1' || campaignId !== '24498275745') return;

    for (const link of browser.document.querySelectorAll('a[data-google-ads-store]')) {
      const measurement = new URL('store-click.html', href);
      measurement.searchParams.set('campaign_id', campaignId);
      measurement.searchParams.set('store', link.dataset.googleAdsStore);
      link.addEventListener('click', () => {
        browser.fetch(measurement.href, {
          keepalive: true,
          cache: 'no-store',
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        }).catch(() => {});
      });
    }
  }

  function start(browser) {
    const target = destination(browser.navigator, browser.location.search);
    const status = browser.document.getElementById('device-status');
    if (status && target) {
      status.textContent = target === stores.ios
        ? 'App Store açılıyor. Açılmazsa aşağıdaki bağlantıya dokunabilirsin.'
        : 'Google Play açılıyor. Açılmazsa aşağıdaki bağlantıya dokunabilirsin.';
    }
    if (target) {
      browser.location.replace(target);
    } else {
      measureGoogleAdsStoreClicks(browser);
    }
  }

  return Object.freeze({ stores: stores, detectPlatform: detectPlatform, destination: destination, start: start });
});
