// A card's words travel in the link's #fragment, which browsers never send to a server.
// Only the recipient's name sits in the path (/for/Lan, /gui/Lan), so chat apps can preview it.

export const FLOWERS = ["lilac", "rose", "mimosa", "aqua"] as const;
export const LANGS = ["en", "vi"] as const;
export const LIMITS = { to: 40, from: 40, msg: 240 } as const;
// The path word is the salutation itself: "For Lan" and, in Vietnamese, "Gửi Lan".
export const ROUTES = { en: "for", vi: "gui" } as const;

export type Flower = (typeof FLOWERS)[number];
export type Lang = (typeof LANGS)[number];
export type Draft = { to: string; msg: string; from: string; flower: Flower };
export type Card = Draft & { lang: Lang | "" };

export const isFlower = (value: unknown): value is Flower => FLOWERS.includes(value as Flower);
export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

export function clean(value: unknown, max: number): string {
  const text = String(value ?? "")
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    // eslint-disable-next-line no-control-regex -- control and bidi-override characters are exactly what this strips
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return Array.from(text).slice(0, max).join("").trim();
}

export const line = (value: unknown, max: number) => clean(String(value ?? "").replace(/\s+/g, " "), max);

export function parseCard(hash: string): Card {
  const params = new URLSearchParams(String(hash || "").replace(/^#/, ""));
  const flower = params.get("f");
  const lang = params.get("lang");
  return {
    to: line(params.get("to"), LIMITS.to),
    from: line(params.get("from"), LIMITS.from),
    msg: clean(params.get("msg"), LIMITS.msg),
    flower: isFlower(flower) ? flower : "lilac",
    lang: isLang(lang) ? lang : "",
  };
}

// "." and ".." are not usable as path segments, so such names stay in the fragment.
export function namePath(to: string, lang: Lang): string | null {
  const name = line(to, LIMITS.to);
  return name && !/^\.\.?$/.test(name) ? `/${ROUTES[lang]}/${encodeURIComponent(name)}` : null;
}

// A dynamic route segment, decoded once and cleaned like any other field.
export function nameFromSegment(segment: string): string {
  let name = segment;
  try {
    name = decodeURIComponent(segment);
  } catch {
    // A stray "%" is part of the name, not an escape
  }
  return line(name, LIMITS.to);
}

export function cardHref(draft: Draft & { lang: Lang }): string {
  const to = line(draft.to, LIMITS.to);
  const msg = clean(draft.msg, LIMITS.msg);
  const from = line(draft.from, LIMITS.from);
  const path = namePath(to, draft.lang);
  const params = new URLSearchParams();
  if (to && !path) params.set("to", to);
  if (msg) params.set("msg", msg);
  if (from) params.set("from", from);
  if (!path && !params.size) return "/";
  if (draft.flower !== "lilac" && isFlower(draft.flower)) params.set("f", draft.flower);
  // A name path already says which language the card is in
  if (!path) params.set("lang", draft.lang);
  const hash = params.toString();
  return (path ?? "/") + (hash ? `#${hash}` : "");
}
