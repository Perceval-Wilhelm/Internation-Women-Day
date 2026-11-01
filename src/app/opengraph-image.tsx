import { renderCardImage } from "@/features/og/card-image";

export const alt = "A violet bouquet blooming under a starry night sky, with the words Happy Women's Day";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderCardImage({ lang: "en" });
}
