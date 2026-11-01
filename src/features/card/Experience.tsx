"use client";

import {
  createContext,
  Fragment,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createSky, type Sky } from "@/features/sky/sky";
import { setLang, useHash, useLang, useMedia, useScrolled } from "./browser";
import { namePath, parseCard, type Draft, type Lang } from "./card";
import { Composer } from "./Composer";
import { Envelope } from "./Envelope";
import { fitBouquet } from "./fit";
import { Letters, splitWords, Words } from "./split";
import { T } from "./T";
import { TEXT } from "./text";

const EMPTY: Draft = { to: "", msg: "", from: "", flower: "lilac" };
// Matches the envelope's opening transitions in global.css
const OPEN_MS = 1300;

type Actions = { compose: () => void; replay: () => void };
const ActionsContext = createContext<Actions | null>(null);

// For server-rendered sections that need a hand in the page: the closing call to action and the footer.
export function ActionButton({
  action,
  className,
  children,
}: {
  action: keyof Actions;
  className: string;
  children: ReactNode;
}) {
  const actions = use(ActionsContext);
  return (
    <button className={className} type="button" onClick={() => actions?.[action]()}>
      {children}
    </button>
  );
}

function Toast({ note }: { note: { id: number; text: string } | null }) {
  const toastRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = toastRef.current;
    if (!el || !note) return;
    if (!el.matches(":popover-open")) el.showPopover();
    const timer = setTimeout(() => el.hidePopover(), 2600);
    return () => clearTimeout(timer);
  }, [note]);
  return (
    <div ref={toastRef} className="toast" popover="manual" role="status">
      {note?.text}
    </div>
  );
}

type Props = {
  /** Set on /for/[name] and /gui/[name]: the recipient's name and the card's language come from the path. */
  lang?: Lang;
  to?: string;
  bouquet: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export function Experience({ lang: routeLang, to: routeTo = "", bouquet, footer, children }: Props) {
  const lang = useLang(routeLang ?? "en");
  const hash = useHash();
  const calm = useMedia("(prefers-reduced-motion: reduce)");
  const touch = useMedia("(hover: none)");
  const scrolled = useScrolled(24);

  const linked = useMemo(() => {
    const card = parseCard(hash);
    return routeTo ? { ...card, to: routeTo } : card;
  }, [hash, routeTo]);

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [composing, setComposing] = useState(false);
  // A preview belongs to the link it was made on; following another link shows that card instead.
  const [preview, setPreview] = useState<{ id: number; hash: string; card: Draft } | null>(null);
  const previewing = preview?.hash === hash ? preview : null;
  const shown: Draft = composing ? draft : (previewing?.card ?? linked);
  const hasNote = Boolean(shown.msg || shown.from);

  // Every card that arrives, and every preview, starts sealed in its envelope.
  const identity = previewing ? `preview:${previewing.id}` : `${routeTo}${hash}`;
  const [opening, setOpening] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const envelope =
    composing || !(shown.to || hasNote) || opened === identity ? null : opening === identity ? "opening" : "sealed";
  const sealed = envelope === "sealed";

  const heroRef = useRef<HTMLElement>(null);
  const skyRef = useRef<Sky | null>(null);
  const bloomedRef = useRef(false);
  const [ready, setReady] = useState(false);
  // Bumping the round remounts the bouquet and the hero text, so every entrance plays again.
  const [round, setRound] = useState(0);
  const [settled, setSettled] = useState(false);
  const [note, setNote] = useState<{ id: number; text: string } | null>(null);

  const replay = useCallback(() => {
    setSettled(false);
    setRound((n) => n + 1);
    scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  }, [calm]);

  const compose = useCallback((start?: Draft) => {
    if (start) setDraft(start);
    setSettled(true);
    setComposing(true);
  }, []);

  const closeComposer = useCallback(() => setComposing(false), []);

  const showPreview = useCallback(() => {
    setPreview({ id: Date.now(), hash, card: draft });
    setComposing(false);
  }, [hash, draft]);

  const notify = useCallback((text: string) => setNote({ id: Date.now(), text }), []);

  const openEnvelope = useCallback(() => {
    if (envelope !== "sealed") return;
    setOpening(identity);
    if (bloomedRef.current) replay();
    setTimeout(
      () => {
        setOpened(identity);
        // Screen readers continue from the message itself
        const hero = heroRef.current;
        (hero?.querySelector<HTMLElement>(".card") ?? hero?.querySelector<HTMLElement>(".title"))?.focus({
          preventScroll: true,
        });
      },
      calm ? 0 : OPEN_MS,
    );
  }, [envelope, identity, calm, replay]);

  const actions = useMemo(() => ({ compose: () => compose(), replay }), [compose, replay]);

  // Ready once the webfonts are in (they set the text's size), or after 1.8 s on a slow connection.
  useEffect(() => {
    let live = true;
    const done = () => {
      if (live) setReady(true);
    };
    const timer = setTimeout(done, 1800);
    document.fonts.ready.then(done);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, []);

  // The sky, fireflies and tap-to-bloom run outside React and are torn down with the hero.
  useEffect(() => {
    if (!heroRef.current) return;
    const instance = createSky(heroRef.current);
    skyRef.current = instance;
    return () => {
      instance.destroy();
      skyRef.current = null;
    };
  }, []);

  // A short beat on the dark sky, then the bloom: right away, or once the envelope is opened.
  const blooming = ready && !sealed;
  useEffect(() => {
    if (!blooming || bloomedRef.current) return;
    const timer = setTimeout(() => {
      bloomedRef.current = true;
      document.documentElement.classList.remove("not-loaded");
      skyRef.current?.begin();
    }, 400);
    return () => clearTimeout(timer);
  }, [blooming]);

  useEffect(() => {
    document.documentElement.classList.toggle("is-sealed", sealed);
  }, [sealed]);

  useEffect(() => {
    skyRef.current?.refreshTheme();
  }, [shown.flower]);

  useEffect(() => {
    document.title = shown.to ? TEXT[lang].docTitleFor(shown.to) : TEXT[lang].docTitle;
  }, [lang, shown.to]);

  useLayoutEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const fit = () => fitBouquet(el);
    fit();
    document.fonts.ready.then(fit);
    addEventListener("resize", fit);
    return () => removeEventListener("resize", fit);
  }, [shown, lang, round]);

  // Sections drift in as they scroll into view.
  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
    return () => reveal.disconnect();
  }, []);

  function switchLang(next: Lang) {
    setLang(next);
    // A card route names its language in the path; swap it so a reload or a forwarded link keeps the choice.
    const path = routeTo ? namePath(routeTo, next) : null;
    if (path) history.replaceState(history.state, "", path + location.hash);
  }

  // In-page links scroll without touching the #fragment, which holds the card.
  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: calm ? "auto" : "smooth" });
  }

  const words = useMemo(() => splitWords(shown.msg), [shown.msg]);
  const heroClass = ["hero", `theme-${shown.flower}`, hasNote && "has-card", settled && "is-settled"]
    .filter(Boolean)
    .join(" ");

  return (
    <ActionsContext value={actions}>
      <header className={scrolled ? "topbar is-scrolled" : "topbar"} inert={sealed}>
        <a className="brand" href="#top" onClick={(event) => jump(event, "top")}>
          <span aria-hidden="true">8·3</span>
          <span className="sr-only">
            <T en="Back to top" vi="Lên đầu trang" />
          </span>
        </a>
        <button className="btn btn--icon" type="button" onClick={replay}>
          <svg className="icon" aria-hidden="true">
            <use href="#i-replay" />
          </svg>
          <span className="sr-only">
            <T en="Replay the bloom" vi="Xem lại hoa nở" />
          </span>
        </button>
        <div className="lang" role="group" aria-label="Language · Ngôn ngữ">
          <button type="button" aria-pressed={lang === "en"} onClick={() => switchLang("en")}>
            EN<span className="sr-only"> English</span>
          </button>
          <button type="button" aria-pressed={lang === "vi"} onClick={() => switchLang("vi")}>
            VI<span className="sr-only"> Tiếng Việt</span>
          </button>
        </div>
        <button className="btn btn--primary btn--compose" type="button" onClick={() => compose()}>
          <svg className="icon" aria-hidden="true">
            <use href="#i-mail" />
          </svg>
          <span className="btn__label">
            <T en="Write a card" vi="Viết thiệp" />
          </span>
        </button>
      </header>

      <main inert={sealed}>
        <section ref={heroRef} className={heroClass} id="top" aria-labelledby="hero-title">
          <div className="stars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="aurora" aria-hidden="true" />
          <span className="shooting-star" aria-hidden="true" />

          <div className="hero__copy" key={`copy-${round}`}>
            <p className="eyebrow">
              {shown.to ? (
                <T en={TEXT.en.eyebrowFor(shown.to)} vi={TEXT.vi.eyebrowFor(shown.to)} />
              ) : (
                <T en={TEXT.en.eyebrow} vi={TEXT.vi.eyebrow} />
              )}
            </p>
            <h1 className="title" id="hero-title" tabIndex={-1}>
              <span className="sr-only">
                <T en={TEXT.en.title} vi={TEXT.vi.title} />
              </span>
              <span className="title__split" aria-hidden="true">
                <span lang="en">
                  <Letters text={TEXT.en.title} />
                </span>
                <span lang="vi">
                  <Letters text={TEXT.vi.title} />
                </span>
              </span>
            </h1>
            {hasNote ? (
              <article className="card" tabIndex={-1} style={{ "--words": words.count } as CSSProperties}>
                {shown.msg && (
                  <p className="card__msg">
                    <Words tokens={words.tokens} />
                  </p>
                )}
                {shown.from && <p className="card__from">— {shown.from}</p>}
                {shown.from && !composing && (
                  <button
                    className="link-btn card__reply"
                    type="button"
                    onClick={() => compose({ ...EMPTY, to: shown.from, flower: shown.flower })}
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="#i-mail" />
                    </svg>
                    <T en={TEXT.en.reply(shown.from)} vi={TEXT.vi.reply(shown.from)} />
                  </button>
                )}
              </article>
            ) : (
              <p className="tagline">
                <T en={TEXT.en.tagline} vi={TEXT.vi.tagline} />
              </p>
            )}
            <a className="scroll-cue" href="#story" onClick={(event) => jump(event, "story")}>
              <T en="Why 8 March?" vi="Vì sao là ngày 8/3?" />
              <svg className="icon" aria-hidden="true">
                <use href="#i-down" />
              </svg>
            </a>
          </div>

          <Fragment key={`bouquet-${round}`}>{bouquet}</Fragment>
          <canvas className="fx" aria-hidden="true" />
          <p className="tap-hint" data-hint aria-hidden="true">
            <svg className="icon" aria-hidden="true">
              <use href="#i-tap" />
            </svg>
            {touch ? (
              <T en={TEXT.en.hintTap} vi={TEXT.vi.hintTap} />
            ) : (
              <T en={TEXT.en.hintClick} vi={TEXT.vi.hintClick} />
            )}
          </p>
        </section>
        {children}
      </main>
      <div inert={sealed}>{footer}</div>

      {envelope && (
        <Envelope to={shown.to} from={shown.from} flower={shown.flower} state={envelope} onOpen={openEnvelope} />
      )}
      <Composer
        open={composing}
        draft={draft}
        lang={lang}
        onDraft={setDraft}
        onClose={closeComposer}
        onPreview={showPreview}
        notify={notify}
      />
      <Toast note={note} />
    </ActionsContext>
  );
}
