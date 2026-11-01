"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { Flower } from "./card";
import { T } from "./T";
import { TEXT } from "./text";

export type EnvelopeState = "sealed" | "opening";

type Props = { to: string; from: string; flower: Flower; state: EnvelopeState; onOpen: () => void };

// Every card arrives sealed. Opening it starts the bloom, so the recipient sees the bouquet grow for them.
export function Envelope({ to, from, flower, state, onOpen }: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  // Escape is the usual way out of a dialog; here the way out is opening the card.
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpen();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [onOpen]);

  return (
    <div
      className={`envelope theme-${flower}`}
      data-state={state}
      role="dialog"
      aria-modal="true"
      aria-labelledby="envelope-to"
    >
      <button ref={buttonRef} className="envelope__button" type="button" onClick={onOpen} disabled={state !== "sealed"}>
        <span className="envelope__body">
          <span className="envelope__art" aria-hidden="true">
            <span className="envelope__back" />
            <span className="envelope__letter">
              <svg>
                <use href="#bloom" />
              </svg>
            </span>
            <span className="envelope__front" />
            <span className="envelope__flap" />
            <span className="envelope__seal">
              <svg>
                <use href="#bloom" />
              </svg>
            </span>
          </span>
          <span className="envelope__address">
            <span
              className="envelope__to"
              id="envelope-to"
              // The salutation shrinks with its length so a long name stays on one line
              style={{ "--chars": Array.from(TEXT.en.envelopeTo(to)).length } as CSSProperties}
            >
              <T en={TEXT.en.envelopeTo(to)} vi={TEXT.vi.envelopeTo(to)} />
            </span>
            {from && (
              <span className="envelope__from">
                <T en={TEXT.en.envelopeFrom(from)} vi={TEXT.vi.envelopeFrom(from)} />
              </span>
            )}
          </span>
        </span>
        <span className="envelope__cta btn btn--primary btn--lg">
          <svg className="icon" aria-hidden="true">
            <use href="#i-mail" />
          </svg>
          <T en="Open your card" vi="Mở thiệp" />
        </span>
      </button>
    </div>
  );
}
