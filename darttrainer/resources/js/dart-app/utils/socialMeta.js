/**
 * Open Graph, Twitter / X un pamata <meta> atjaunināšana (WhatsApp, Messenger, Telegram, LinkedIn u.c.).
 * Atkarībā no maršruta un locales (i18n).
 */
import { useLocaleStore } from '../store/locale.js';

const APP_NAME = 'DartTrainer';

const OG_IMAGE_PATH = '/images/og/og-image.svg';
const OG_IMAGE_W = 1200;
const OG_IMAGE_H = 630;

const DESC_KEY_BY_PATH = {
  '/': 'meta.descHome',
  '/login': 'meta.descLogin',
  '/register': 'meta.descRegister',
  '/friends': 'meta.descFriends',
  '/stats': 'meta.descStats',
  '/admin': 'meta.descAdmin',
  '/lobby/cricket': 'meta.descLobbyCricket',
  '/lobby/x01': 'meta.descLobbyX01',
  '/training/x01': 'meta.descTrainingX01',
};

function descKeyForPath(path) {
  if (path.startsWith('/game/')) return 'meta.descGame';
  if (path in DESC_KEY_BY_PATH) return DESC_KEY_BY_PATH[path];
  return 'meta.descDefault';
}

function setMetaName(name, content) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaProperty(prop, content) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[property="${prop}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', prop);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function absUrl(pathOrUrl) {
  if (typeof window === 'undefined') return pathOrUrl;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  return `${window.location.origin.replace(/\/$/, '')}${
    pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  }`;
}

/**
 * Izsaucot no router.afterEach (pēc document.title) un kad mainās valoda.
 * @param {import('vue-router').RouteLocationNormalized} route
 */
export function applySocialMeta(route) {
  if (typeof document === 'undefined') return;
  const locale = useLocaleStore();
  const t = (k) => locale.t(k);

  const path = route.path || '/';
  const descKey = descKeyForPath(path);
  const description = t(descKey) || t('meta.descDefault');
  const siteName = t('meta.siteName') || APP_NAME;
  const imageAlt = t('meta.ogImageAlt') || siteName;
  const title = document.title && document.title.length ? document.title : `${siteName}`;
  const pageUrl = `${window.location.origin}${(route.fullPath || '/').split('#')[0]}`;
  const imageUrl = absUrl(OG_IMAGE_PATH);
  const ogLocale = locale.locale === 'en' ? 'en_US' : 'lv_LV';
  const ogLocaleAlt = locale.locale === 'en' ? 'lv_LV' : 'en_US';

  setMetaName('description', description);
  setMetaName('application-name', siteName);
  setMetaName('theme-color', '#0a1120');
  setMetaName('apple-mobile-web-app-title', siteName);
  setMetaName('format-detection', 'telephone=no');
  setMetaName('robots', 'index,follow');

  setMetaProperty('og:site_name', siteName);
  setMetaProperty('og:type', 'website');
  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', pageUrl);
  setMetaProperty('og:locale', ogLocale);
  setMetaProperty('og:locale:alternate', ogLocaleAlt);
  setMetaProperty('og:image', imageUrl);
  setMetaProperty('og:image:secure_url', imageUrl);
  setMetaProperty('og:image:width', String(OG_IMAGE_W));
  setMetaProperty('og:image:height', String(OG_IMAGE_H));
  setMetaProperty('og:image:alt', imageAlt);
  setMetaProperty('og:image:type', 'image/svg+xml');

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  setMetaName('twitter:image:alt', imageAlt);
  setMetaName('twitter:image', imageUrl);

  /* <link rel="canonical"> uztur router pēc $router.afterEach (upsertCanonical) */
}
