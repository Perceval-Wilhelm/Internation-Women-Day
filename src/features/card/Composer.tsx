"use client";

import { useEffect, useRef, type ChangeEvent } from "react";
import { useClientValue } from "./browser";
import { cardHref, FLOWERS, LIMITS, type Draft, type Flower, type Lang } from "./card";
import { T } from "./T";
import { PRESETS, TEXT, type Preset } from "./text";

const FLOWER_NAMES: Record<Flower, [en: string, vi: string]> = {
  lilac: ["Lilac", "Tím"],
  rose: ["Rose", "Hồng"],
  mimosa: ["Mimosa", "Mimosa"],
  aqua: ["Aqua", "Xanh ngọc"],
};

const PRESET_NAMES: Record<Preset, [en: string, vi: string]> = {
  mom: ["For Mom", "Gửi mẹ"],
  love: ["For my love", "Gửi người thương"],
  friend: ["For a friend", "Gửi bạn thân"],
  work: ["For a colleague", "Gửi đồng nghiệp"],
};

type Props = {
  open: boolean;
  draft: Draft;
  lang: Lang;
  onDraft: (draft: Draft) => void;
  onClose: () => void;
  onPreview: () => void;
  notify: (text: string) => void;
};

// The card being written shows live in the hero behind this sheet.
export function Composer({ open, draft, lang, onDraft, onClose, onPreview, notify }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const origin = useClientValue(() => location.origin, "");
  const canShare = useClientValue(() => typeof navigator.share === "function", false);
  const text = TEXT[lang];
  const url = origin + cardHref({ ...draft, lang });

  useEffect(() => {
    const sheet = dialogRef.current;
    if (open && !sheet?.open) sheet?.showModal();
    if (!open && sheet?.open) sheet.close();
  }, [open]);

  useEffect(() => {
    const sheet = dialogRef.current;
    if (!sheet) return;
    const backdrop = (event: MouseEvent) => {
      if (event.target === sheet) sheet.close();
    };
    sheet.addEventListener("close", onClose);
    sheet.addEventListener("click", backdrop);
    return () => {
      sheet.removeEventListener("close", onClose);
      sheet.removeEventListener("click", backdrop);
    };
  }, [onClose]);

  const edit = (field: "to" | "msg" | "from") => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onDraft({ ...draft, [field]: event.target.value });

  function applyPreset(preset: Preset) {
    onDraft({ ...draft, msg: text.presets[preset] });
    messageRef.current?.focus();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      notify(text.copied);
    } catch {
      linkRef.current?.focus();
      linkRef.current?.select();
      notify(text.copyFailed);
    }
  }

  function share() {
    // Dismissing the share sheet rejects; that is not an error
    navigator.share({ title: document.title, text: text.shareText, url }).catch(() => {});
  }

  return (
    <dialog ref={dialogRef} className="composer" aria-labelledby="composer-title">
      <form className="composer__form" noValidate onSubmit={(event) => event.preventDefault()}>
        <header className="composer__head">
          <div>
            <h2 id="composer-title">
              <T en="Send a bloom" vi="Gửi một đóa hoa" />
            </h2>
            <p>
              <T
                en="Write a few words. The flowers do the rest."
                vi="Viết vài lời yêu thương, hoa sẽ lo phần còn lại."
              />
            </p>
          </div>
          <button className="btn btn--icon" type="button" onClick={() => dialogRef.current?.close()}>
            <svg className="icon" aria-hidden="true">
              <use href="#i-close" />
            </svg>
            <span className="sr-only">
              <T en="Close" vi="Đóng" />
            </span>
          </button>
        </header>

        <label className="field">
          <span className="field__label">
            <T en="To" vi="Gửi đến" />
          </span>
          <input
            className="input"
            name="to"
            maxLength={LIMITS.to}
            autoComplete="off"
            enterKeyHint="next"
            placeholder={text.placeholders.to}
            value={draft.to}
            onChange={edit("to")}
          />
        </label>

        <fieldset className="field">
          <legend className="field__label">
            <T en="Her flowers" vi="Chọn hoa" />
          </legend>
          <div className="picker">
            {FLOWERS.map((flower) => (
              <label key={flower} className={`pick pick--${flower}`}>
                <input
                  type="radio"
                  name="flower"
                  value={flower}
                  checked={draft.flower === flower}
                  onChange={() => onDraft({ ...draft, flower })}
                />
                <svg aria-hidden="true">
                  <use href="#bloom" />
                </svg>
                <T en={FLOWER_NAMES[flower][0]} vi={FLOWER_NAMES[flower][1]} />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label className="field__label" htmlFor="msg">
            <T en="Message" vi="Lời nhắn" />
          </label>
          <div className="presets" role="group" aria-label="Ideas · Gợi ý">
            {PRESETS.map((preset) => (
              <button key={preset} className="chip" type="button" onClick={() => applyPreset(preset)}>
                <T en={PRESET_NAMES[preset][0]} vi={PRESET_NAMES[preset][1]} />
              </button>
            ))}
          </div>
          <textarea
            ref={messageRef}
            className="input"
            id="msg"
            name="msg"
            rows={4}
            maxLength={LIMITS.msg}
            placeholder={text.placeholders.msg}
            value={draft.msg}
            onChange={edit("msg")}
          />
          <p className="field__count">
            {Array.from(draft.msg).length}/{LIMITS.msg}
          </p>
        </div>

        <label className="field">
          <span className="field__label">
            <T en="From" vi="Người gửi" />
          </span>
          <input
            className="input"
            name="from"
            maxLength={LIMITS.from}
            autoComplete="name"
            enterKeyHint="done"
            placeholder={text.placeholders.from}
            value={draft.from}
            onChange={edit("from")}
          />
        </label>

        <div className="composer__actions">
          <button className="btn btn--primary" type="button" onClick={copy}>
            <svg className="icon" aria-hidden="true">
              <use href="#i-link" />
            </svg>
            <T en="Copy link" vi="Sao chép link" />
          </button>
          {canShare && (
            <button className="btn" type="button" onClick={share}>
              <svg className="icon" aria-hidden="true">
                <use href="#i-share" />
              </svg>
              <T en="Share" vi="Chia sẻ" />
            </button>
          )}
          <button className="btn" type="button" onClick={onPreview}>
            <svg className="icon" aria-hidden="true">
              <use href="#i-eye" />
            </svg>
            <T en="Preview" vi="Xem trước" />
          </button>
        </div>
        <input
          ref={linkRef}
          className="input composer__link"
          readOnly
          value={url}
          aria-label="Card link · Link thiệp"
        />
        <p className="composer__note">
          <svg className="icon" aria-hidden="true">
            <use href="#i-lock" />
          </svg>
          <span>
            <T
              en="Your message lives only in the link and never reaches a server. Only the name is read, to show it in chat previews."
              vi="Lời nhắn chỉ nằm trong đường link, không bao giờ gửi lên máy chủ. Chỉ có tên người nhận được dùng để hiện trong bản xem trước khi chia sẻ."
            />
          </span>
        </p>
      </form>
    </dialog>
  );
}
