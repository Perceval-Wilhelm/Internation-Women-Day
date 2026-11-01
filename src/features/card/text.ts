import type { Lang } from "./card";

// Words used outside the markup: attributes, notifications, titles and share text.
// Text inside the page ships in both languages through <T>.
export const TEXT = {
  en: {
    eyebrow: "International Women's Day · 8 March",
    eyebrowFor: (to: string) => `For ${to} · 8 March`,
    title: "Happy Women's Day",
    tagline: "To every woman who makes the world bloom.",
    docTitle: "Happy International Women's Day · 8 March",
    docTitleFor: (to: string) => `For ${to} · Happy Women's Day 💐`,
    previewTitleFor: (to: string) => `${to}, a bloom for you 💐`,
    cardDescription: "Someone wrote you an 8 March card. Open it and watch your bouquet bloom.",
    envelopeTo: (to: string) => (to ? `For ${to}` : "For you"),
    envelopeFrom: (from: string) => `from ${from}`,
    reply: (from: string) => `Send a bloom back to ${from}`,
    hintTap: "Tap anywhere to make it bloom",
    hintClick: "Click anywhere to make it bloom",
    copied: "Link copied. Send it with love 💜",
    copyFailed: "Copy the link below to send it",
    shareText: "A little bloom for you 💐",
    placeholders: { to: "Her name", msg: "Write from the heart…", from: "Your name" },
    presets: {
      mom: "Mom, thank you for every sacrifice you never mentioned and every hug I never had to ask for. I love you.",
      love: "You make ordinary days feel like spring. Happy Women's Day to the one I love most.",
      friend: "To the friend who is always in my corner: keep shining, keep blooming, keep being you.",
      work: "Thank you for the brilliance, kindness and grit you bring every single day. Happy Women's Day!",
    },
  },
  vi: {
    eyebrow: "Ngày Quốc tế Phụ nữ",
    eyebrowFor: (to: string) => `Gửi ${to} · 8/3`,
    title: "Chúc mừng ngày 8/3",
    tagline: "Gửi những người phụ nữ làm thế giới nở hoa.",
    docTitle: "Chúc mừng Ngày Quốc tế Phụ nữ 8/3",
    docTitleFor: (to: string) => `Gửi ${to} · Chúc mừng ngày 8/3 💐`,
    previewTitleFor: (to: string) => `${to} ơi, có một đóa hoa gửi bạn 💐`,
    cardDescription: "Ai đó vừa viết cho bạn một tấm thiệp 8/3. Mở ra và ngắm bó hoa của bạn nở.",
    envelopeTo: (to: string) => (to ? `Gửi ${to}` : "Gửi bạn"),
    envelopeFrom: (from: string) => `từ ${from}`,
    reply: (from: string) => `Gửi lại ${from} một đóa hoa`,
    hintTap: "Chạm vào bất kỳ đâu để hoa nở",
    hintClick: "Nhấn vào bất kỳ đâu để hoa nở",
    copied: "Đã sao chép link. Gửi ngay nhé 💜",
    copyFailed: "Hãy sao chép link bên dưới để gửi",
    shareText: "Gửi bạn một đóa hoa nhỏ 💐",
    placeholders: { to: "Tên người nhận", msg: "Viết từ trái tim…", from: "Tên của bạn" },
    presets: {
      mom: "Mẹ ơi, cảm ơn mẹ vì những hy sinh mẹ chưa bao giờ nhắc đến, và những cái ôm con chưa từng phải xin. Con yêu mẹ nhiều lắm!",
      love: "Có em, ngày bình thường nào cũng hóa mùa xuân. Chúc người mình thương nhất một ngày 8/3 thật hạnh phúc!",
      friend: "Gửi cô bạn luôn đứng về phía mình: cứ rạng rỡ, cứ nở hoa và cứ là chính cậu nhé!",
      work: "Cảm ơn bạn vì sự tận tâm, tài năng và tử tế mỗi ngày. Chúc mừng ngày 8/3!",
    },
  },
} satisfies Record<Lang, unknown>;

export type Preset = keyof typeof TEXT.en.presets;
export const PRESETS = Object.keys(TEXT.en.presets) as Preset[];
