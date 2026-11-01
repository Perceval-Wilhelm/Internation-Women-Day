import type { CSSProperties } from "react";

// The CSS-art bouquet, adapted from Md Usman Ansari's “CSS Blossoming Flowers at Magical Night” (MIT; see THIRD_PARTY_NOTICES.md). Every part is positioned from the 0×0 .flowers anchor
// and grows on its own delay, so the markup stays exactly as bouquet.css expects it.
const count = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const after = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

function Leaf({ index, delay }: { index: number; delay: number }) {
  return (
    <div className="grow-ans" style={after(delay)}>
      <div className={`leaf leaf--${index}`} />
    </div>
  );
}

// A long stem grows four leaves; their delays give the bouquet its unhurried rhythm.
function Stem({ index, delays: [a, b, c, d] }: { index: number; delays: [number, number, number, number] }) {
  return (
    <div className={`long-g long-g--${index}`}>
      <Leaf index={0} delay={a} />
      <Leaf index={1} delay={b} />
      <Leaf index={2} delay={c} />
      <Leaf index={3} delay={d} />
    </div>
  );
}

function Flower({ index, stemLeaves }: { index: number; stemLeaves: number }) {
  return (
    <div className={`flower flower--${index}`}>
      <div className={`flower__leafs flower__leafs--${index}`}>
        {count(4).map((i) => (
          <div key={i} className={`flower__leaf flower__leaf--${i}`} />
        ))}
        <div className="flower__white-circle" />
        {count(8).map((i) => (
          <div key={i} className={`flower__light flower__light--${i}`} />
        ))}
      </div>
      <div className="flower__line">
        {count(stemLeaves).map((i) => (
          <div key={i} className={`flower__line__leaf flower__line__leaf--${i}`} />
        ))}
      </div>
    </div>
  );
}

function Grass({ index }: { index: number }) {
  return (
    <div className="growing-grass">
      <div className={`flower__grass flower__grass--${index}`}>
        <div className="flower__grass--top" />
        <div className="flower__grass--bottom" />
        {count(8).map((i) => (
          <div key={i} className={`flower__grass__leaf flower__grass__leaf--${i}`} />
        ))}
        <div className="flower__grass__overlay" />
      </div>
    </div>
  );
}

export function Bouquet() {
  return (
    <div className="flowers" aria-hidden="true">
      <Flower index={1} stemLeaves={6} />
      <Flower index={2} stemLeaves={4} />
      <Flower index={3} stemLeaves={4} />

      <div className="grow-ans" style={after(1.2)}>
        <div className="flower__g-long">
          <div className="flower__g-long__top" />
          <div className="flower__g-long__bottom" />
        </div>
      </div>

      <Grass index={1} />
      <Grass index={2} />

      <div className="grow-ans" style={after(2.4)}>
        <div className="flower__g-right flower__g-right--1">
          <div className="leaf" />
        </div>
      </div>
      <div className="grow-ans" style={after(2.8)}>
        <div className="flower__g-right flower__g-right--2">
          <div className="leaf" />
        </div>
      </div>

      <div className="grow-ans" style={after(2.8)}>
        <div className="flower__g-front">
          {count(8).map((i) => (
            <div key={i} className={`flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--${i}`}>
              <div className="flower__g-front__leaf" />
            </div>
          ))}
          <div className="flower__g-front__line" />
        </div>
      </div>

      <div className="grow-ans" style={after(3.2)}>
        <div className="flower__g-fr">
          <div className="leaf" />
          {count(8).map((i) => (
            <div key={i} className={`flower__g-fr__leaf flower__g-fr__leaf--${i}`} />
          ))}
        </div>
      </div>

      <Stem index={0} delays={[3, 2.2, 3.4, 3.6]} />
      <Stem index={1} delays={[3.6, 3.8, 4, 4.2]} />
      <Stem index={2} delays={[4, 4.2, 4.4, 4.6]} />
      <Stem index={3} delays={[4, 4.2, 3, 3.6]} />
      <Stem index={4} delays={[4, 4.2, 3, 3.6]} />
      <Stem index={5} delays={[4, 4.2, 3, 3.6]} />
      <Stem index={6} delays={[4.2, 4.4, 4.6, 4.8]} />
      <Stem index={7} delays={[3, 3.2, 3.5, 3.6]} />
    </div>
  );
}
