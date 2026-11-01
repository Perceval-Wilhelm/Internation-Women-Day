import { useCallback, useSyncExternalStore } from "react";
import type { Lang } from "./card";

// Browser state read without hydration mismatches: React first renders the value the server used,
// then the live one, and renders again whenever the browser reports a change.

const never = () => () => {};
export const useClientValue = <T>(read: () => T, server: T): T => useSyncExternalStore(never, read, () => server);

function onWindow(type: "hashchange" | "scroll") {
  return (notify: () => void) => {
    addEventListener(type, notify, { passive: true });
    return () => removeEventListener(type, notify);
  };
}
const onHash = onWindow("hashchange");
const onScroll = onWindow("scroll");

export const useHash = () =>
  useSyncExternalStore(
    onHash,
    () => location.hash,
    () => "",
  );

export const useScrolled = (offset: number) =>
  useSyncExternalStore(
    onScroll,
    () => scrollY > offset,
    () => false,
  );

export function useMedia(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(query).matches,
    () => false,
  );
}

// The language lives on <html lang>, which the layout's inline script sets before first paint.
const langListeners = new Set<() => void>();
function onLang(notify: () => void) {
  langListeners.add(notify);
  return () => {
    langListeners.delete(notify);
  };
}

export const useLang = (server: Lang): Lang =>
  useSyncExternalStore(
    onLang,
    () => (document.documentElement.lang === "vi" ? "vi" : "en"),
    () => server,
  );

export function setLang(next: Lang) {
  document.documentElement.lang = next;
  try {
    localStorage.setItem("lang", next);
  } catch {
    // Storage can be off (private mode); the choice just isn't remembered
  }
  langListeners.forEach((notify) => notify());
}
