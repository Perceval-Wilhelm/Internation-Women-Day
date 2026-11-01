import { nameFromSegment } from "@/features/card/card";
import { renderCardImage } from "@/features/og/card-image";

export const alt = "A personal 8 March card: a bouquet blooming under a starry night sky";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  return renderCardImage({ name: nameFromSegment((await params).name), lang: "en" });
}
