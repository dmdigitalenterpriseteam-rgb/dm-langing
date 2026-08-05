(function () {
  'use strict';

  var GA_ID = 'G-7LWKLNLDHE';
  var STORAGE_KEY = 'dm_consent_v1';
  var CONSENT_VERSION = 1;
  var analyticsLoaded = false;

  var text = {
    de: {
      title: 'Datenschutz-Einstellungen',
      intro: 'Wir verwenden notwendige Speicherfunktionen für Ihre Auswahl. Google Analytics wird erst geladen, wenn Sie der anonymisierten Reichweitenmessung zustimmen.',
      accept: 'Alle akzeptieren',
      reject: 'Nur notwendige',
      settings: 'Einstellungen',
      settingsTitle: 'Cookie-Einstellungen',
      necessaryTitle: 'Notwendige Funktionen',
      necessaryText: 'Erforderlich, um Ihre Datenschutzauswahl auf diesem Gerät zu speichern.',
      analyticsTitle: 'Statistik mit Google Analytics',
      analyticsText: 'Hilft uns zu verstehen, welche Seiten genutzt werden. Wird nur nach Ihrer Einwilligung aktiviert.',
      always: 'Immer aktiv',
      save: 'Auswahl speichern',
      back: 'Zurück',
      privacy: 'Datenschutzerklärung',
      reopen: 'Cookie-Einstellungen'
    },
    en: {
      title: 'Privacy settings',
      intro: 'We use necessary storage to remember your choice. Google Analytics loads only after you consent to anonymous audience measurement.',
      accept: 'Accept all',
      reject: 'Necessary only',
      settings: 'Settings',
      settingsTitle: 'Cookie settings',
      necessaryTitle: 'Necessary functions',
      necessaryText: 'Required to remember your privacy choice on this device.',
      analyticsTitle: 'Statistics with Google Analytics',
      analyticsText: 'Helps us understand which pages are used. Activated only after your consent.',
      always: 'Always active',
      save: 'Save selection',
      back: 'Back',
      privacy: 'Privacy policy',
      reopen: 'Cookie settings'
    },
    sr: {
      title: 'Podešavanja privatnosti',
      intro: 'Koristimo neophodno lokalno čuvanje kako bismo zapamtili vaš izbor. Google Analytics se učitava tek kada prihvatite anonimno merenje posećenosti.',
      accept: 'Prihvati sve',
      reject: 'Samo neophodno',
      settings: 'Podešavanja',
      settingsTitle: 'Podešavanja kolačića',
      necessaryTitle: 'Neophodne funkcije',
      necessaryText: 'Potrebne su da bi izbor privatnosti ostao sačuvan na ovom uređaju.',
      analyticsTitle: 'Statistika uz Google Analytics',
      analyticsText: 'Pomaže nam da razumemo koje stranice se koriste. Aktivira se samo uz vašu saglasnost.',
      always: 'Uvek aktivno',
      save: 'Sačuvaj izbor',
      back: 'Nazad',
      privacy: 'Politika privatnosti',
      reopen: 'Podešavanja kolačića'
    }
  };

  function getLanguage() {
    var lang = (document.documentElement.lang || 'de').toLowerCase();
    if (lang.indexOf('sr') === 0) return 'sr';
    if (lang.indexOf('en') === 0) return 'en';
    return 'de';
  }

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var saved = JSON.parse(raw);
      if (!saved || saved.version !== CONSENT_VERSION || typeof saved.analytics !== 'boolean') return null;
      return saved;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(analytics) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: CONSENT_VERSION,
        analytics: Boolean(analytics),
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}
  }

  function deleteAnalyticsCookies() {
    var names = document.cookie.split(';').map(function (part) {
      return part.split('=')[0].trim();
    }).filter(function (name) {
      return name === '_ga' || name.indexOf('_ga_') === 0;
    });

    var host = location.hostname;
    var domains = ['', host, '.' + host, '.dmdigitalenterprise.com'];
    names.forEach(function (name) {
      domains.forEach(function (domain) {
        var domainPart = domain ? '; domain=' + domain : '';
        document.cookie = name + '=; Max-Age=0; path=/' + domainPart + '; SameSite=Lax';
      });
    });
  }

  function prepareConsentQueue() {
    window.dataLayer = window.dataLayer || [];
    function dmGtag() { window.dataLayer.push(arguments); }
    dmGtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });
    return dmGtag;
  }

  var dmGtag = prepareConsentQueue();

  function enableAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;

    dmGtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    window.gtag = dmGtag;
    dmGtag('js', new Date());
    dmGtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    script.dataset.dmAnalytics = 'true';
    document.head.appendChild(script);
  }

  function disableAnalytics(reloadPage) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    deleteAnalyticsCookies();
    if (reloadPage && analyticsLoaded) location.reload();
  }

  function injectStyles() {
    if (document.getElementById('dm-consent-styles')) return;
    var style = document.createElement('style');
    style.id = 'dm-consent-styles';
    style.textContent = [
      '#dm-consent-root{position:fixed;inset:0;z-index:2147483646;display:none;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#edf3fb}',
      '#dm-consent-root.is-open{display:block}',
      '.dm-consent-backdrop{position:absolute;inset:0;background:rgba(2,6,12,.70);backdrop-filter:blur(5px)}',
      '.dm-consent-panel{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);width:min(760px,calc(100% - 28px));background:#101722;border:1px solid rgba(255,255,255,.16);border-radius:22px;box-shadow:0 25px 80px rgba(0,0,0,.55);padding:24px}',
      '.dm-consent-panel h2{margin:0 0 9px;font-size:clamp(1.25rem,3vw,1.7rem);line-height:1.2}',
      '.dm-consent-panel p{margin:0;color:#bbc6d3;line-height:1.55}',
      '.dm-consent-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}',
      '.dm-consent-btn{appearance:none;border:1px solid rgba(255,255,255,.16);border-radius:999px;min-height:46px;padding:10px 16px;font:inherit;font-weight:800;cursor:pointer}',
      '.dm-consent-btn.primary{background:linear-gradient(90deg,#62e0c6,#9fa8fe);color:#07111f}',
      '.dm-consent-btn.necessary{background:#e7eef7;color:#0a1320}',
      '.dm-consent-btn.secondary{grid-column:1/-1;background:transparent;color:#edf3fb}',
      '.dm-consent-links{display:flex;justify-content:center;margin-top:12px;font-size:14px}',
      '.dm-consent-links a{color:#9fdff2;text-decoration:underline;text-underline-offset:3px}',
      '.dm-consent-details{display:none}',
      '#dm-consent-root.show-details .dm-consent-summary{display:none}',
      '#dm-consent-root.show-details .dm-consent-details{display:block}',
      '.dm-consent-option{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:16px 0;border-top:1px solid rgba(255,255,255,.10)}',
      '.dm-consent-option:first-of-type{margin-top:14px}',
      '.dm-consent-option h3{margin:0 0 5px;font-size:1rem}',
      '.dm-consent-option p{font-size:.92rem}',
      '.dm-consent-always{font-size:.82rem;color:#8ee7cf;font-weight:800;white-space:nowrap}',
      '.dm-consent-switch{position:relative;width:52px;height:30px}',
      '.dm-consent-switch input{position:absolute;opacity:0;pointer-events:none}',
      '.dm-consent-switch span{position:absolute;inset:0;background:#596575;border-radius:999px;cursor:pointer;transition:.2s}',
      '.dm-consent-switch span:before{content:"";position:absolute;width:22px;height:22px;left:4px;top:4px;border-radius:50%;background:white;transition:.2s}',
      '.dm-consent-switch input:checked+span{background:#62e0c6}',
      '.dm-consent-switch input:checked+span:before{transform:translateX(22px)}',
      '.dm-consent-detail-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}',
      '#dm-cookie-settings-button{position:fixed;left:14px;bottom:14px;z-index:2147483645;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(13,19,26,.94);color:#e7eef7;padding:8px 12px;font:600 12px/1.2 Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.32);cursor:pointer}',
      '#dm-cookie-settings-button:hover{background:#172231}',
      '@media(max-width:620px){.dm-consent-panel{padding:20px;bottom:10px}.dm-consent-actions,.dm-consent-detail-actions{grid-template-columns:1fr}.dm-consent-btn.secondary{grid-column:auto}.dm-consent-option{gap:10px}#dm-cookie-settings-button{bottom:12px;left:10px}}',
      '@media print{#dm-consent-root,#dm-cookie-settings-button{display:none!important}}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildInterface() {
    injectStyles();
    var lang = getLanguage();
    var t = text[lang];
    var current = readConsent();

    var root = document.createElement('div');
    root.id = 'dm-consent-root';
    root.innerHTML = '' +
      '<div class="dm-consent-backdrop"></div>' +
      '<section class="dm-consent-panel" role="dialog" aria-modal="true" aria-labelledby="dm-consent-title">' +
        '<div class="dm-consent-summary">' +
          '<h2 id="dm-consent-title" data-dm-text="title"></h2>' +
          '<p data-dm-text="intro"></p>' +
          '<div class="dm-consent-actions">' +
            '<button type="button" class="dm-consent-btn primary" data-dm-action="accept"></button>' +
            '<button type="button" class="dm-consent-btn necessary" data-dm-action="reject"></button>' +
            '<button type="button" class="dm-consent-btn secondary" data-dm-action="details"></button>' +
          '</div>' +
          '<div class="dm-consent-links"><a href="/datenschutz.html" data-dm-text="privacy"></a></div>' +
        '</div>' +
        '<div class="dm-consent-details">' +
          '<h2 data-dm-text="settingsTitle"></h2>' +
          '<div class="dm-consent-option">' +
            '<div><h3 data-dm-text="necessaryTitle"></h3><p data-dm-text="necessaryText"></p></div>' +
            '<span class="dm-consent-always" data-dm-text="always"></span>' +
          '</div>' +
          '<div class="dm-consent-option">' +
            '<div><h3 data-dm-text="analyticsTitle"></h3><p data-dm-text="analyticsText"></p></div>' +
            '<label class="dm-consent-switch"><input id="dm-analytics-choice" type="checkbox"><span aria-hidden="true"></span></label>' +
          '</div>' +
          '<div class="dm-consent-detail-actions">' +
            '<button type="button" class="dm-consent-btn secondary" data-dm-action="back"></button>' +
            '<button type="button" class="dm-consent-btn primary" data-dm-action="save"></button>' +
          '</div>' +
        '</div>' +
      '</section>';

    document.body.appendChild(root);

    var reopen = document.createElement('button');
    reopen.id = 'dm-cookie-settings-button';
    reopen.type = 'button';
    reopen.dataset.dmAction = 'reopen';
    document.body.appendChild(reopen);

    function translate() {
      var tr = text[getLanguage()];
      root.querySelectorAll('[data-dm-text]').forEach(function (node) {
        node.textContent = tr[node.getAttribute('data-dm-text')] || '';
      });
      root.querySelector('[data-dm-action="accept"]').textContent = tr.accept;
      root.querySelector('[data-dm-action="reject"]').textContent = tr.reject;
      root.querySelector('[data-dm-action="details"]').textContent = tr.settings;
      root.querySelector('[data-dm-action="back"]').textContent = tr.back;
      root.querySelector('[data-dm-action="save"]').textContent = tr.save;
      reopen.textContent = tr.reopen;
      reopen.setAttribute('aria-label', tr.reopen);
    }

    function open(showDetails) {
      var saved = readConsent();
      root.classList.toggle('show-details', Boolean(showDetails));
      root.classList.add('is-open');
      document.getElementById('dm-analytics-choice').checked = saved ? saved.analytics : false;
      translate();
      setTimeout(function () {
        var focusTarget = showDetails ? root.querySelector('[data-dm-action="save"]') : root.querySelector('[data-dm-action="accept"]');
        if (focusTarget) focusTarget.focus();
      }, 0);
    }

    function close() {
      root.classList.remove('is-open', 'show-details');
    }

    root.addEventListener('click', function (event) {
      var actionNode = event.target.closest('[data-dm-action]');
      if (!actionNode) return;
      var action = actionNode.getAttribute('data-dm-action');

      if (action === 'accept') {
        writeConsent(true);
        enableAnalytics();
        close();
      } else if (action === 'reject') {
        writeConsent(false);
        disableAnalytics(false);
        close();
      } else if (action === 'details') {
        root.classList.add('show-details');
        document.getElementById('dm-analytics-choice').checked = current ? current.analytics : false;
        translate();
      } else if (action === 'back') {
        root.classList.remove('show-details');
      } else if (action === 'save') {
        var analytics = document.getElementById('dm-analytics-choice').checked;
        writeConsent(analytics);
        if (analytics) {
          enableAnalytics();
          close();
        } else {
          var hadAnalytics = analyticsLoaded;
          disableAnalytics(hadAnalytics);
          if (!hadAnalytics) close();
        }
      }
    });

    reopen.addEventListener('click', function () { open(true); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && root.classList.contains('is-open') && readConsent()) close();
    });

    var observer = new MutationObserver(function (mutations) {
      if (mutations.some(function (m) { return m.attributeName === 'lang'; })) translate();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    translate();
    if (!current) setTimeout(function () { open(false); }, 250);
  }

  var savedConsent = readConsent();
  if (savedConsent && savedConsent.analytics) enableAnalytics();
  else deleteAnalyticsCookies();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildInterface);
  else buildInterface();
})();
