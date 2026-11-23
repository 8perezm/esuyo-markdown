// Tiny hand-rolled i18n layer. No dependency, no deep merge: dictionaries are
// flat key → string maps, so adding a locale is just another module in this
// folder plus an entry in LOCALES. All shipped locales are LTR.

import { messages as en } from "./en.js";
import { messages as es } from "./es.js";
import { messages as de } from "./de.js";
import { messages as af } from "./af.js";
import { messages as am } from "./am.js";
import { messages as az } from "./az.js";
import { messages as be } from "./be.js";
import { messages as bg } from "./bg.js";
import { messages as bn } from "./bn.js";
import { messages as bs } from "./bs.js";
import { messages as ca } from "./ca.js";
import { messages as cs } from "./cs.js";
import { messages as cy } from "./cy.js";
import { messages as da } from "./da.js";
import { messages as el } from "./el.js";
import { messages as eo } from "./eo.js";
import { messages as et } from "./et.js";
import { messages as eu } from "./eu.js";
import { messages as fi } from "./fi.js";
import { messages as fil } from "./fil.js";
import { messages as fr } from "./fr.js";
import { messages as ga } from "./ga.js";
import { messages as gl } from "./gl.js";
import { messages as gu } from "./gu.js";
import { messages as hi } from "./hi.js";
import { messages as hr } from "./hr.js";
import { messages as hu } from "./hu.js";
import { messages as hy } from "./hy.js";
import { messages as id } from "./id.js";
import { messages as is } from "./is.js";
import { messages as it } from "./it.js";
import { messages as ja } from "./ja.js";
import { messages as ka } from "./ka.js";
import { messages as kk } from "./kk.js";
import { messages as km } from "./km.js";
import { messages as kn } from "./kn.js";
import { messages as ko } from "./ko.js";
import { messages as ky } from "./ky.js";
import { messages as lb } from "./lb.js";
import { messages as lt } from "./lt.js";
import { messages as lo } from "./lo.js";
import { messages as lv } from "./lv.js";
import { messages as mk } from "./mk.js";
import { messages as ml } from "./ml.js";
import { messages as mn } from "./mn.js";
import { messages as mr } from "./mr.js";
import { messages as ms } from "./ms.js";
import { messages as mt } from "./mt.js";
import { messages as my } from "./my.js";
import { messages as nb } from "./nb.js";
import { messages as ne } from "./ne.js";
import { messages as nl } from "./nl.js";
import { messages as pa } from "./pa.js";
import { messages as pl } from "./pl.js";
import { messages as pt } from "./pt.js";
import { messages as pt_BR } from "./pt-BR.js";
import { messages as ro } from "./ro.js";
import { messages as ru } from "./ru.js";
import { messages as si } from "./si.js";
import { messages as sk } from "./sk.js";
import { messages as sl } from "./sl.js";
import { messages as sq } from "./sq.js";
import { messages as sr } from "./sr.js";
import { messages as sv } from "./sv.js";
import { messages as sw } from "./sw.js";
import { messages as ta } from "./ta.js";
import { messages as te } from "./te.js";
import { messages as th } from "./th.js";
import { messages as tr } from "./tr.js";
import { messages as uk } from "./uk.js";
import { messages as uz } from "./uz.js";
import { messages as vi } from "./vi.js";
import { messages as zh_CN } from "./zh-CN.js";
import { messages as zh_TW } from "./zh-TW.js";
import { messages as zu } from "./zu.js";

export const DEFAULT_LOCALE = "en";
/** Sentinel stored when the user wants the OS locale to decide. */
export const SYSTEM_LOCALE = "";

/** `code` is what gets persisted; `nativeName` is what the picker displays. */
export const LOCALES = [
    { code: "en", nativeName: "English" },
    { code: "es", nativeName: "Español" },
    { code: "de", nativeName: "Deutsch" },
    { code: "af", nativeName: "Afrikaans" },
    { code: "am", nativeName: "አማርኛ" },
    { code: "az", nativeName: "Azərbaycanca" },
    { code: "be", nativeName: "Беларуская" },
    { code: "bg", nativeName: "Български" },
    { code: "bn", nativeName: "বাংলা" },
    { code: "bs", nativeName: "Bosanski" },
    { code: "ca", nativeName: "Català" },
    { code: "cs", nativeName: "Čeština" },
    { code: "cy", nativeName: "Cymraeg" },
    { code: "da", nativeName: "Dansk" },
    { code: "el", nativeName: "Ελληνικά" },
    { code: "eo", nativeName: "Esperanto" },
    { code: "et", nativeName: "Eesti" },
    { code: "eu", nativeName: "Euskara" },
    { code: "fi", nativeName: "Suomi" },
    { code: "fil", nativeName: "Filipino" },
    { code: "fr", nativeName: "Français" },
    { code: "ga", nativeName: "Gaeilge" },
    { code: "gl", nativeName: "Galego" },
    { code: "gu", nativeName: "ગુજરાતી" },
    { code: "hi", nativeName: "हिन्दी" },
    { code: "hr", nativeName: "Hrvatski" },
    { code: "hu", nativeName: "Magyar" },
    { code: "hy", nativeName: "Հայերեն" },
    { code: "id", nativeName: "Bahasa Indonesia" },
    { code: "is", nativeName: "Íslenska" },
    { code: "it", nativeName: "Italiano" },
    { code: "ja", nativeName: "日本語" },
    { code: "ka", nativeName: "ქართული" },
    { code: "kk", nativeName: "Қазақша" },
    { code: "km", nativeName: "ខ្មែរ" },
    { code: "kn", nativeName: "ಕನ್ನಡ" },
    { code: "ko", nativeName: "한국어" },
    { code: "ky", nativeName: "Кыргызча" },
    { code: "lb", nativeName: "Lëtzebuergesch" },
    { code: "lt", nativeName: "Lietuvių" },
    { code: "lo", nativeName: "ລາວ" },
    { code: "lv", nativeName: "Latviešu" },
    { code: "mk", nativeName: "Македонски" },
    { code: "ml", nativeName: "മലയാളം" },
    { code: "mn", nativeName: "Монгол" },
    { code: "mr", nativeName: "मराठी" },
    { code: "ms", nativeName: "Bahasa Melayu" },
    { code: "mt", nativeName: "Malti" },
    { code: "my", nativeName: "မြန်မာ" },
    { code: "nb", nativeName: "Norsk bokmål" },
    { code: "ne", nativeName: "नेपाली" },
    { code: "nl", nativeName: "Nederlands" },
    { code: "pa", nativeName: "ਪੰਜਾਬੀ" },
    { code: "pl", nativeName: "Polski" },
    { code: "pt", nativeName: "Português" },
    { code: "pt-BR", nativeName: "Português (Brasil)" },
    { code: "ro", nativeName: "Română" },
    { code: "ru", nativeName: "Русский" },
    { code: "si", nativeName: "සිංහල" },
    { code: "sk", nativeName: "Slovenčina" },
    { code: "sl", nativeName: "Slovenščina" },
    { code: "sq", nativeName: "Shqip" },
    { code: "sr", nativeName: "Srpski" },
    { code: "sv", nativeName: "Svenska" },
    { code: "sw", nativeName: "Kiswahili" },
    { code: "ta", nativeName: "தமிழ்" },
    { code: "te", nativeName: "తెలుగు" },
    { code: "th", nativeName: "ไทย" },
    { code: "tr", nativeName: "Türkçe" },
    { code: "uk", nativeName: "Українська" },
    { code: "uz", nativeName: "Oʻzbekcha" },
    { code: "vi", nativeName: "Tiếng Việt" },
    { code: "zh-CN", nativeName: "简体中文" },
    { code: "zh-TW", nativeName: "繁體中文" },
    { code: "zu", nativeName: "isiZulu" },
];

const dictionaries = {
    "en": en,
    "es": es,
    "de": de,
    "af": af,
    "am": am,
    "az": az,
    "be": be,
    "bg": bg,
    "bn": bn,
    "bs": bs,
    "ca": ca,
    "cs": cs,
    "cy": cy,
    "da": da,
    "el": el,
    "eo": eo,
    "et": et,
    "eu": eu,
    "fi": fi,
    "fil": fil,
    "fr": fr,
    "ga": ga,
    "gl": gl,
    "gu": gu,
    "hi": hi,
    "hr": hr,
    "hu": hu,
    "hy": hy,
    "id": id,
    "is": is,
    "it": it,
    "ja": ja,
    "ka": ka,
    "kk": kk,
    "km": km,
    "kn": kn,
    "ko": ko,
    "ky": ky,
    "lb": lb,
    "lt": lt,
    "lo": lo,
    "lv": lv,
    "mk": mk,
    "ml": ml,
    "mn": mn,
    "mr": mr,
    "ms": ms,
    "mt": mt,
    "my": my,
    "nb": nb,
    "ne": ne,
    "nl": nl,
    "pa": pa,
    "pl": pl,
    "pt": pt,
    "pt-BR": pt_BR,
    "ro": ro,
    "ru": ru,
    "si": si,
    "sk": sk,
    "sl": sl,
    "sq": sq,
    "sr": sr,
    "sv": sv,
    "sw": sw,
    "ta": ta,
    "te": te,
    "th": th,
    "tr": tr,
    "uk": uk,
    "uz": uz,
    "vi": vi,
    "zh-CN": zh_CN,
    "zh-TW": zh_TW,
    "zu": zu,
};

// Regional / script tags that do not reduce to a supported base language.
const LOCALE_ALIASES = {
    zh: "zh-CN",
    "zh-hans": "zh-CN",
    "zh-hant": "zh-TW",
    no: "nb",
    "nb-no": "nb",
    "nn-no": "nb",
};

let currentLocale = DEFAULT_LOCALE;
let currentDictionary = en;

/**
 * Pick the best supported locale for a requested tag.
 * Resolution: exact → base language (`es-ES` → `es`) → English.
 * A missing/empty request means "use the OS locale".
 */
export function resolveLocale(requested) {
    let tag = requested;
    if (tag === undefined || tag === null || tag === "") {
        tag = typeof navigator !== "undefined" ? navigator.language : DEFAULT_LOCALE;
    }
    const normalized = String(tag).replace(/_/g, "-").toLowerCase();
    if (LOCALE_ALIASES[normalized]) return LOCALE_ALIASES[normalized];
    for (const { code } of LOCALES) {
        if (code.toLowerCase() === normalized) return code;
    }
    const base = normalized.split("-")[0];
    for (const { code } of LOCALES) {
        if (code.toLowerCase() === base) return code;
    }
    return DEFAULT_LOCALE;
}

function lookup(key) {
    return currentDictionary[key] ?? en[key] ?? null;
}

/** Replace `{name}` marks with values from `params` (never with HTML). */
function interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, name) =>
        params && Object.prototype.hasOwnProperty.call(params, name)
            ? String(params[name])
            : match
    );
}

function warnMissing(key) {
    // `import.meta.env.DEV` is replaced with `false` in production builds, so
    // this branch is stripped from the shipped bundle.
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation for "${key}" (locale: ${currentLocale})`);
    }
}

/** Translate a key. Falls back to English, then to the key itself. */
export function t(key, params) {
    const template = lookup(key);
    if (template === null) {
        warnMissing(key);
        return key;
    }
    return interpolate(template, params);
}

/**
 * Translate a plural key using Intl.PluralRules for the active locale.
 * Looks up `<key>_<category>` first (e.g. `_one`, `_other`, and `_few`/`_many`
 * for languages that need them), then `<key>_other`, then `<key>`.
 * `count` is always available to the template as `{count}`.
 */
export function tp(key, count, params = {}) {
    let category = "other";
    try {
        category = new Intl.PluralRules(currentLocale).select(count);
    } catch {
        category = count === 1 ? "one" : "other";
    }
    const template =
        lookup(`${key}_${category}`) ?? lookup(`${key}_other`) ?? lookup(key);
    if (template === null) {
        warnMissing(`${key}_${category}`);
        return key;
    }
    return interpolate(template, { ...params, count });
}

/** Sweep the document for `data-i18n*` attributes and apply translations. */
export function applyTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
        el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
        el.setAttribute("title", t(el.dataset.i18nTitle));
    });
    root.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
}

export function getLocale() {
    return currentLocale;
}

/**
 * Resolve, activate and apply a locale in one step. Call on startup (with the
 * stored preference, which may be SYSTEM_LOCALE) before rendering dynamic UI.
 */
export function applyLocale(requested) {
    currentLocale = resolveLocale(requested);
    currentDictionary = dictionaries[currentLocale] ?? en;
    document.documentElement.lang = currentLocale;
    document.title = t("app.title");
    applyTranslations();
    return currentLocale;
}
