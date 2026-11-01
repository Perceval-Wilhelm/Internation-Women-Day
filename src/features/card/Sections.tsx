import type { CSSProperties, ReactNode } from "react";
import { ActionButton } from "./Experience";
import { T } from "./T";

const delay = (seconds: number) => ({ "--delay": `${seconds}s` }) as CSSProperties;

const MOMENTS: { year: ReactNode; en: string; vi: string }[] = [
  {
    year: "1909",
    en: "The first National Woman's Day is held in the United States on 28 February, in honour of the garment workers who struck in New York.",
    vi: "Ngày Phụ nữ Quốc gia đầu tiên diễn ra tại Mỹ vào ngày 28/2, để tôn vinh những nữ công nhân may đã đình công ở New York.",
  },
  {
    year: "1910",
    en: "At a conference in Copenhagen, Clara Zetkin proposes a women's day marked every year, everywhere. Over a hundred women from 17 countries agree.",
    vi: "Tại hội nghị ở Copenhagen, Clara Zetkin đề xuất một ngày của phụ nữ được kỷ niệm hằng năm, ở khắp mọi nơi. Hơn 100 đại biểu nữ đến từ 17 quốc gia cùng đồng thuận.",
  },
  {
    year: "1911",
    en: "The first International Women's Day, on 19 March: over a million people rally in Austria, Denmark, Germany and Switzerland.",
    vi: "Ngày Quốc tế Phụ nữ đầu tiên, 19/3: hơn một triệu người xuống đường tại Áo, Đan Mạch, Đức và Thụy Sĩ.",
  },
  {
    year: "1917",
    en: "On 8 March, women workers in Petrograd strike for “Bread and Peace”. Their protest helps spark the February Revolution, and that year Russian women win the vote.",
    vi: "Ngày 8/3, nữ công nhân Petrograd đình công đòi “Bánh mì và Hòa bình”. Cuộc đấu tranh góp phần châm ngòi Cách mạng Tháng Hai, và ngay năm đó phụ nữ Nga giành được quyền bầu cử.",
  },
  {
    year: "1975",
    en: "The United Nations celebrates International Women's Day for the first time, during International Women's Year. Two years later, its General Assembly invites every country to set aside a day for women's rights and peace.",
    vi: "Liên Hợp Quốc lần đầu kỷ niệm Ngày Quốc tế Phụ nữ, nhân Năm Quốc tế Phụ nữ. Hai năm sau, Đại hội đồng kêu gọi mọi quốc gia dành một ngày cho quyền phụ nữ và hòa bình.",
  },
  {
    year: "1995",
    en: "In Beijing, 189 countries adopt the Beijing Declaration and Platform for Action, still the world's key plan for gender equality.",
    vi: "Tại Bắc Kinh, 189 quốc gia thông qua Tuyên bố và Cương lĩnh hành động Bắc Kinh, đến nay vẫn là văn kiện toàn cầu then chốt vì bình đẳng giới.",
  },
  {
    year: <T en="Today" vi="Hôm nay" />,
    en: "A day to celebrate what women achieve, and to keep going until equality is real, everywhere.",
    vi: "Một ngày để tôn vinh những gì phụ nữ đã làm được, và tiếp bước cho đến khi bình đẳng thật sự có mặt ở mọi nơi.",
  },
];

const SWATCHES = [
  { name: ["Purple", "Tím"], meaning: ["Justice & dignity", "Công lý và phẩm giá"], tone: "purple" },
  { name: ["Green", "Xanh lá"], meaning: ["Hope", "Hy vọng"], tone: "green" },
  { name: ["White", "Trắng"], meaning: ["Purity", "Sự thuần khiết"], tone: "white" },
];

const QUOTES = [
  {
    en: "One is not born, but rather becomes, a woman.",
    vi: "Người ta không sinh ra là đàn bà, người ta trở thành đàn bà.",
    who: "Simone de Beauvoir",
    source: (
      <T
        en={
          <>
            <cite>The Second Sex</cite>, 1949
          </>
        }
        vi={
          <>
            <cite>Giới tính thứ hai</cite>, 1949
          </>
        }
      />
    ),
  },
  {
    en: "Anon, who wrote so many poems without signing them, was often a woman.",
    vi: "Vô Danh, người đã viết biết bao bài thơ mà không ký tên, thường là một người phụ nữ.",
    who: "Virginia Woolf",
    source: (
      <T
        en={
          <>
            <cite>A Room of One&apos;s Own</cite>, 1929
          </>
        }
        vi={
          <>
            <cite>Căn phòng riêng</cite>, 1929
          </>
        }
      />
    ),
  },
  {
    en: "One child, one teacher, one book and one pen can change the world.",
    vi: "Một đứa trẻ, một người thầy, một cuốn sách và một cây bút có thể thay đổi thế giới.",
    who: "Malala Yousafzai",
    source: <T en="United Nations, 2013" vi="Liên Hợp Quốc, 2013" />,
  },
];

export function Sections() {
  return (
    <>
      <section className="section story" id="story" aria-labelledby="story-title">
        <header className="section-head reveal">
          <p className="eyebrow">
            <T en="Why 8 March?" vi="Vì sao là ngày 8/3?" />
          </p>
          <h2 className="section-title" id="story-title">
            <T
              en={
                <>
                  A day that began with <em>courage</em>
                </>
              }
              vi={
                <>
                  Một ngày bắt đầu từ <em>lòng can đảm</em>
                </>
              }
            />
          </h2>
        </header>
        <ol className="timeline">
          {MOMENTS.map((moment) => (
            <li key={moment.en} className="moment reveal">
              <span className="moment__bud" aria-hidden="true">
                <svg>
                  <use href="#bloom" />
                </svg>
              </span>
              <p className="moment__year">{moment.year}</p>
              <p className="moment__text">
                <T en={moment.en} vi={moment.vi} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="section colours" aria-labelledby="colours-title">
        <header className="section-head reveal">
          <p className="eyebrow">
            <T en="The colours of 8 March" vi="Sắc màu của ngày 8/3" />
          </p>
          <h2 className="section-title" id="colours-title">
            <T
              en={
                <>
                  <span className="c-purple">Purple</span>, <span className="c-green">green</span> &amp;{" "}
                  <span className="c-white">white</span>
                </>
              }
              vi={
                <>
                  <span className="c-purple">Tím</span>, <span className="c-green">xanh lá</span> &amp;{" "}
                  <span className="c-white">trắng</span>
                </>
              }
            />
          </h2>
          <p className="section-lede">
            <T
              en="Chosen in 1908 by the Women's Social and Political Union, Britain's suffragettes, and still the colours of International Women's Day."
              vi="Được Liên minh Xã hội và Chính trị Phụ nữ (WSPU), những người đấu tranh cho quyền bầu cử của phụ nữ Anh, chọn từ năm 1908, và đến nay vẫn là sắc màu của Ngày Quốc tế Phụ nữ."
            />
          </p>
        </header>
        <ul className="swatches">
          {SWATCHES.map((swatch, i) => (
            <li key={swatch.tone} className={`swatch swatch--${swatch.tone} reveal`} style={delay(i * 0.12)}>
              <span className="swatch__orb" aria-hidden="true" />
              <span className="swatch__name">
                <T en={swatch.name[0]} vi={swatch.name[1]} />
              </span>
              <span className="swatch__meaning">
                <T en={swatch.meaning[0]} vi={swatch.meaning[1]} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section voices" aria-labelledby="voices-title">
        <header className="section-head reveal">
          <p className="eyebrow">
            <T en="Voices" vi="Những tiếng nói" />
          </p>
          <h2 className="section-title" id="voices-title">
            <T
              en={
                <>
                  Words that <em>bloomed</em>
                </>
              }
              vi={
                <>
                  Những lời đã <em>nở hoa</em>
                </>
              }
            />
          </h2>
        </header>
        <div className="quotes">
          {QUOTES.map((quote, i) => (
            <figure key={quote.who} className="quote reveal" style={delay(i * 0.12)}>
              <blockquote>
                <p lang="en">{quote.en}</p>
                <p lang="vi">{quote.vi}</p>
              </blockquote>
              <figcaption>
                <strong>{quote.who}</strong>
                {quote.source}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section finale" aria-labelledby="finale-title">
        <div className="reveal">
          <h2 className="section-title" id="finale-title">
            <T
              en={
                <>
                  Who will you send <em>a bloom</em> to?
                </>
              }
              vi={
                <>
                  Hôm nay, bạn sẽ gửi <em>hoa</em> cho ai?
                </>
              }
            />
          </h2>
          <ActionButton action="compose" className="btn btn--primary btn--lg">
            <svg className="icon" aria-hidden="true">
              <use href="#i-mail" />
            </svg>
            <T en="Write a card" vi="Viết thiệp" />
          </ActionButton>
        </div>
      </section>
    </>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span className="brand" aria-hidden="true">
        8·3
      </span>
      <p>
        <T en="Made with love, for every woman." vi="Gửi tới mọi người phụ nữ, bằng cả trái tim." />
      </p>
      <ActionButton action="replay" className="link-btn">
        <svg className="icon" aria-hidden="true">
          <use href="#i-replay" />
        </svg>
        <T en="Replay the bloom" vi="Xem lại hoa nở" />
      </ActionButton>
    </footer>
  );
}

// One shared bloom and icon set, referenced with <use href="#…">.
export function Sprites() {
  return (
    <svg className="sprites" aria-hidden="true" focusable="false">
      <symbol id="bloom" viewBox="-12 -12 24 24">
        <g fill="currentColor">
          {[0, 72, 144, 216, 288].map((turn) => (
            <ellipse key={turn} cy="-6" rx="3.8" ry="5.8" transform={`rotate(${turn})`} />
          ))}
        </g>
        <circle r="3.2" fill="#ffd98a" />
      </symbol>
      <symbol id="i-mail" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </symbol>
      <symbol id="i-replay" viewBox="0 0 24 24">
        <path d="M3 12a9 9 0 1 0 2.64-6.36" />
        <path d="M3 4v4.5h4.5" />
      </symbol>
      <symbol id="i-link" viewBox="0 0 24 24">
        <path d="M10 14a4.5 4.5 0 0 0 6.36 0l3.18-3.18a4.5 4.5 0 0 0-6.36-6.36l-1.06 1.06" />
        <path d="M14 10a4.5 4.5 0 0 0-6.36 0l-3.18 3.18a4.5 4.5 0 0 0 6.36 6.36l1.06-1.06" />
      </symbol>
      <symbol id="i-share" viewBox="0 0 24 24">
        <path d="M12 15V3" />
        <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
      </symbol>
      <symbol id="i-eye" viewBox="0 0 24 24">
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.8" />
      </symbol>
      <symbol id="i-close" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6 6 18" />
      </symbol>
      <symbol id="i-down" viewBox="0 0 24 24">
        <path d="M12 5v14" />
        <path d="m6 13 6 6 6-6" />
      </symbol>
      <symbol id="i-lock" viewBox="0 0 24 24">
        <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
        <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      </symbol>
      <symbol id="i-tap" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" opacity=".5" />
      </symbol>
    </svg>
  );
}
