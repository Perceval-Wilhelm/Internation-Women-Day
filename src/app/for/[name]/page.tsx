import type { Metadata } from "next";
import { nameFromSegment } from "@/features/card/card";
import { CardPage, cardMetadata } from "@/features/card/CardPage";

// Each name renders on its first visit and is then served from the cache.
export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/for/[name]">): Promise<Metadata> {
  return cardMetadata(nameFromSegment((await params).name), "en");
}

export default async function ForPage({ params }: PageProps<"/for/[name]">) {
  return <CardPage lang="en" to={nameFromSegment((await params).name)} />;
}
