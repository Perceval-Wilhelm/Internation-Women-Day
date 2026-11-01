import type { Metadata } from "next";
import { Bouquet } from "@/features/bouquet/Bouquet";
import { SITE_NAME } from "@/lib/site";
import { namePath, type Lang } from "./card";
import { Experience } from "./Experience";
import { Footer, Sections, Sprites } from "./Sections";
import { TEXT } from "./text";

// Card routes are personal: chat apps may preview them, search engines should not list them.
export function cardMetadata(to: string, lang: Lang): Metadata {
  const text = TEXT[lang];
  const path = namePath(to, lang) ?? "/";
  return {
    title: to ? text.docTitleFor(to) : text.docTitle,
    description: text.cardDescription,
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: path,
      title: to ? text.previewTitleFor(to) : text.docTitle,
      description: text.cardDescription,
      locale: lang === "vi" ? "vi_VN" : "en_GB",
    },
  };
}

export function CardPage({ lang, to }: { lang?: Lang; to?: string }) {
  return (
    <>
      <Sprites />
      <Experience lang={lang} to={to} bouquet={<Bouquet />} footer={<Footer />}>
        <Sections />
      </Experience>
    </>
  );
}
