import { nameFromSegment } from "@/features/card/card";
import { renderCardImage } from "@/features/og/card-image";

export const alt = "Một tấm thiệp 8/3: bó hoa nở dưới bầu trời đêm đầy sao";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ name: string }> }) {
  return renderCardImage({ name: nameFromSegment((await params).name), lang: "vi" });
}
