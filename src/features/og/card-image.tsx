import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { Lang } from "@/features/card/card";

const COPY = {
  en: {
    eyebrow: "International Women's Day · 8 March",
    eyebrowFor: "A card for you · 8 March",
    title: "Happy Women's Day",
    second: "Chúc mừng ngày Quốc tế Phụ nữ",
    note: "Open it to watch your bouquet bloom",
  },
  vi: {
    eyebrow: "Ngày Quốc tế Phụ nữ · 8/3",
    eyebrowFor: "Một tấm thiệp cho bạn · 8/3",
    title: "Chúc mừng ngày 8/3",
    second: "Happy International Women's Day",
    note: "Mở thiệp để ngắm bó hoa nở",
  },
};

// The fonts come from Fontsource (SIL Open Font License, see assets/LICENSE-*.txt), one file per subset;
// listing the subsets in order gives Vietnamese letters their own glyphs.
const SUBSETS = ["latin", "latin-ext", "vietnamese"];
const FAMILIES = {
  script: { file: "great-vibes", weight: 400, style: "normal" },
  serif: { file: "cormorant-garamond", weight: 600, style: "italic" },
  sans: { file: "be-vietnam-pro", weight: 500, style: "normal" },
} as const;
const stack = (family: keyof typeof FAMILIES) => SUBSETS.map((subset) => `${family}-${subset}`).join(", ");

// One fixed folder, so the build ships only these files with the image functions.
const asset = (name: string) => readFile(join(process.cwd(), "src/features/og/assets", name));

async function loadFonts() {
  return Promise.all(
    Object.entries(FAMILIES).flatMap(([family, { file, weight, style }]) =>
      SUBSETS.map(async (subset) => ({
        name: `${family}-${subset}`,
        data: await asset(`${file}-${subset}-${weight}-${style}.woff`),
        weight,
        style,
      })),
    ),
  );
}

// Short names are written in script; longer ones switch to the serif, whose spaces stay readable.
// Either way they shrink so up to 40 characters fit beside the bouquet.
function nameStyle(name: string) {
  const length = Math.max(Array.from(name).length, 1);
  return length <= 16
    ? { fontFamily: stack("script"), fontSize: Math.round(Math.min(150, 1100 / length)) }
    : {
        fontFamily: stack("serif"),
        fontStyle: "italic" as const,
        fontWeight: 600,
        fontSize: Math.round(Math.max(44, 1150 / length)),
      };
}

export async function renderCardImage({ name = "", lang }: { name?: string; lang: Lang }) {
  const copy = COPY[lang];
  const [sky, fonts] = await Promise.all([asset("sky.jpg"), loadFonts()]);
  const glow = "0 0 34px rgba(192, 132, 252, 0.55)";

  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#0d0719", color: "#fbf6ff" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered into the PNG, never into a page */}
      <img
        src={`data:image/jpeg;base64,${sky.toString("base64")}`}
        width={1200}
        height={630}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 700,
          height: "100%",
          paddingLeft: 84,
        }}
      >
        <div style={{ display: "flex", fontFamily: stack("sans"), fontSize: 20, letterSpacing: 4, color: "#f4d58d" }}>
          {(name ? copy.eyebrowFor : copy.eyebrow).toUpperCase()}
        </div>
        {name ? (
          <div
            style={{
              display: "flex",
              marginTop: 12,
              ...nameStyle(name),
              lineHeight: 1.12,
              textShadow: glow,
            }}
          >
            {name}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            marginTop: name ? 4 : 18,
            fontFamily: stack("serif"),
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: name ? 60 : 76,
            lineHeight: 1.04,
            textShadow: glow,
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: name ? 22 : 16,
            fontFamily: stack(name ? "sans" : "serif"),
            fontStyle: name ? "normal" : "italic",
            fontWeight: name ? 500 : 600,
            fontSize: name ? 24 : 40,
            color: "rgba(251, 246, 255, 0.74)",
          }}
        >
          {name ? copy.note : copy.second}
        </div>
      </div>
    </div>,
    { width: 1200, height: 630, fonts },
  );
}
