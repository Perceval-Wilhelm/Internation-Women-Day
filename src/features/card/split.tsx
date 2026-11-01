import { Fragment, type CSSProperties } from "react";

const segmenter = "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
const graphemes = (text: string) =>
  segmenter ? Array.from(segmenter.segment(text), (part) => part.segment) : Array.from(text);
const order = (i: number) => ({ "--i": i }) as CSSProperties;

function splitLetters(text: string) {
  let i = 0;
  return text.split(" ").map((word, key) => ({ key, letters: graphemes(word).map((glyph) => ({ glyph, i: i++ })) }));
}

// Each letter gets an index that CSS staggers by. Words stay unbreakable so lines only wrap between them;
// letters are graphemes so Vietnamese diacritics and emoji are never cut apart.
export function Letters({ text }: { text: string }) {
  return splitLetters(text).map(({ key, letters }) => (
    <Fragment key={key}>
      {key > 0 && " "}
      <span className="w">
        {letters.map(({ glyph, i }) => (
          <span key={i} className="ch" style={order(i)}>
            {glyph}
          </span>
        ))}
      </span>
    </Fragment>
  ));
}

type Token = { key: number } & ({ word: string; i: number } | { space: true } | { br: true });

// A message as words, spaces and the writer's line breaks; words are numbered for the stagger.
export function splitWords(text: string): { tokens: Token[]; count: number } {
  const tokens: Token[] = [];
  let count = 0;
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (part.trim()) tokens.push({ key: tokens.length, word: part, i: count++ });
    else if (!part.includes("\n")) tokens.push({ key: tokens.length, space: true });
    else for (let n = part.split("\n").length - 1; n > 0; n--) tokens.push({ key: tokens.length, br: true });
  }
  return { tokens, count };
}

export function Words({ tokens }: { tokens: Token[] }) {
  return tokens.map((token) =>
    "word" in token ? (
      <span key={token.key} className="w" style={order(token.i)}>
        {token.word}
      </span>
    ) : "br" in token ? (
      <br key={token.key} />
    ) : (
      <Fragment key={token.key}> </Fragment>
    ),
  );
}
