import type { ReactNode } from "react";

// Both languages ship in the HTML; the stylesheet shows the one that matches <html lang>,
// so a link opens in its language before any JavaScript runs.
export function T({ en, vi }: { en: ReactNode; vi: ReactNode }) {
  return (
    <>
      <span lang="en">{en}</span>
      <span lang="vi">{vi}</span>
    </>
  );
}
