// Page logic: the opening sequence, language, the personal card, the composer and scroll reveals.
(() => {
  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const TEXT = {
    en: {
      eyebrowFor: 'For {to} · 8 March',
      title: "Happy Women's Day",
      docTitle: "Happy International Women's Day · 8 March",
      docTitleFor: "For {to} · Happy Women's Day 💐",
      hintTap: 'Tap anywhere to make it bloom',
      hintClick: 'Click anywhere to make it bloom',
      copied: 'Link copied. Send it with love 💜',
      copyFailed: 'Copy the link below to send it',
      shareText: 'A little bloom for you 💐',
      placeholders: { to: 'Her name', msg: 'Write from the heart…', from: 'Your name' },
      presets: {
        mom: 'Mom, thank you for every sacrifice you never mentioned and every hug I never had to ask for. I love you.',
        love: "You make ordinary days feel like spring. Happy Women's Day to the one I love most.",
        friend: 'To the friend who is always in my corner: keep shining, keep blooming, keep being you.',
        work: "Thank you for the brilliance, kindness and grit you bring every single day. Happy Women's Day!",
      },
    },
    vi: {
      eyebrowFor: 'Gửi {to} · 8/3',
      title: 'Chúc mừng ngày 8/3',
      docTitle: 'Chúc mừng Ngày Quốc tế Phụ nữ 8/3',
      docTitleFor: 'Gửi {to} · Chúc mừng ngày 8/3 💐',
      hintTap: 'Chạm vào bất kỳ đâu để hoa nở',
      hintClick: 'Nhấn vào bất kỳ đâu để hoa nở',
      copied: 'Đã sao chép link. Gửi ngay nhé 💜',
      copyFailed: 'Hãy sao chép link bên dưới để gửi',
      shareText: 'Gửi bạn một đóa hoa nhỏ 💐',
      placeholders: { to: 'Tên người nhận', msg: 'Viết từ trái tim…', from: 'Tên của bạn' },
      presets: {
        mom: 'Mẹ ơi, cảm ơn mẹ vì những hy sinh mẹ chưa bao giờ nhắc đến, và những cái ôm con chưa từng phải xin. Con yêu mẹ nhiều lắm!',
        love: 'Có em, ngày bình thường nào cũng hóa mùa xuân. Chúc người mình thương nhất một ngày 8/3 thật hạnh phúc!',
        friend: 'Gửi cô bạn luôn đứng về phía mình: cứ rạng rỡ, cứ nở hoa và cứ là chính cậu nhé!',
        work: 'Cảm ơn bạn vì sự tận tâm, tài năng và tử tế mỗi ngày. Chúc mừng ngày 8/3!',
      },
    },
  };

  const hero = $('.hero');
  const eyebrow = $('[data-eyebrow]');
  const eyebrowDefault = eyebrow.innerHTML;
  const titleText = $('[data-title-text]');
  const titleSplit = $('[data-title]');
  const tagline = $('[data-tagline]');
  const cardEl = $('[data-card]');
  const cardMsg = $('[data-card-msg]');
  const cardFrom = $('[data-card-from]');
  const hintText = $('[data-hint-text]');
  const dialog = $('#composer');
  const form = $('form', dialog);
  const linkField = $('[data-link]', dialog);
  const counter = $('[data-count]', dialog);
  const shareButton = $('[data-share]', dialog);
  const toast = $('[data-toast]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');

  let lang = root.lang === 'vi' ? 'vi' : 'en';
  let current = Card.parseCard(location.hash); // the card this link carries
  let draft = { to: '', msg: '', from: '', flower: 'lilac' }; // the card being written

  // A function replacement, so a name like "$&" is inserted literally
  const fill = (template, to) => template.replace('{to}', () => to);

  const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  const graphemes = text => (segmenter ? Array.from(segmenter.segment(text), part => part.segment) : Array.from(text));

  // Wraps each word (and for the title, each letter) in a span that CSS staggers in by its --i.
  // Words stay unbreakable so lines only wrap between them; letters are graphemes so Vietnamese
  // diacritics and emoji are never cut apart.
  function split(el, text, letters) {
    el.textContent = '';
    let index = 0;
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      if (!part.trim()) {
        const breaks = part.split('\n').length - 1;
        if (!breaks) el.append(' ');
        for (let i = 0; i < breaks; i++) el.append(document.createElement('br'));
        continue;
      }
      const word = document.createElement('span');
      word.className = 'w';
      if (letters) {
        for (const glyph of graphemes(part)) {
          const letter = document.createElement('span');
          letter.className = 'ch';
          letter.textContent = glyph;
          letter.style.setProperty('--i', index++);
          word.append(letter);
        }
      } else {
        word.textContent = part;
        word.style.setProperty('--i', index++);
      }
      el.append(word);
    }
    return index;
  }

  function setFlower(flower) {
    if (hero.dataset.flower === flower) return;
    for (const name of Card.FLOWERS) hero.classList.toggle(`theme-${name}`, name === flower);
    hero.dataset.flower = flower;
    window.Sky?.refreshTheme();
  }

  // Shrinks the bouquet just enough to clear the text above it, for any screen and message length.
  // Its top petal sits 0.89 × scale × vmin above the .flowers anchor (measured from the art).
  function fitBouquet() {
    hero.style.removeProperty('--fit');
    const textBottom = Math.max(...$$('.hero__copy > :not([hidden])', hero)
      .filter(el => getComputedStyle(el).position !== 'absolute')
      .map(el => el.getBoundingClientRect().bottom));
    const anchor = $('.flowers', hero).getBoundingClientRect().bottom;
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const fit = (anchor - textBottom - 24) / (89 * vmin);
    if (fit < parseFloat(getComputedStyle(hero).getPropertyValue('--bouquet-scale'))) {
      hero.style.setProperty('--fit', Math.max(fit, 0.45).toFixed(3));
    }
  }

  function render(card, { replayTitle = false } = {}) {
    const text = TEXT[lang];
    if (card.to) eyebrow.textContent = fill(text.eyebrowFor, card.to);
    else eyebrow.innerHTML = eyebrowDefault;

    if (replayTitle || titleSplit.dataset.text !== text.title) {
      titleText.textContent = text.title;
      split(titleSplit, text.title, true);
      titleSplit.dataset.text = text.title;
    }

    const hasCard = Boolean(card.msg || card.from);
    tagline.hidden = hasCard;
    cardEl.hidden = !hasCard;
    hero.classList.toggle('has-card', hasCard);
    if (hasCard) {
      cardEl.style.setProperty('--words', split(cardMsg, card.msg, false));
      cardMsg.hidden = !card.msg;
      cardFrom.textContent = card.from ? `— ${card.from}` : '';
      cardFrom.hidden = !card.from;
    }

    setFlower(card.flower);
    document.title = card.to ? fill(text.docTitleFor, card.to) : text.docTitle;
    fitBouquet();
  }

  function setLang(next, remember) {
    lang = next;
    root.lang = next;
    for (const button of $$('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === next));
    for (const field of $$('[data-ph]')) field.placeholder = TEXT[next].placeholders[field.dataset.ph];
    hintText.textContent = matchMedia('(hover: none)').matches ? TEXT[next].hintTap : TEXT[next].hintClick;
    render(dialog.open ? draft : current);
    if (dialog.open) updateLink();
    if (remember) {
      try {
        localStorage.setItem('lang', next);
      } catch {
        // Storage can be off (private mode); the choice just isn't remembered
      }
    }
  }

  // Restarts a CSS animation by removing it for one style recalculation
  function restart(el) {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }

  function replay() {
    const flowers = $('.flowers', hero);
    flowers.replaceWith(flowers.cloneNode(true)); // a fresh copy restarts all ~150 bouquet animations at once
    hero.classList.remove('is-settled');
    render(current, { replayTitle: true });
    for (const el of $$('.eyebrow, .tagline, .card, .card__from, .scroll-cue', hero)) restart(el);
    window.scrollTo({ top: 0, behavior: calm.matches ? 'auto' : 'smooth' });
  }

  // ---------- Composer ----------

  const cardUrl = () => location.href.split('#')[0] + Card.buildHash({ ...draft, lang });

  function readForm() {
    const data = new FormData(form);
    return { to: data.get('to') || '', msg: data.get('msg') || '', from: data.get('from') || '', flower: data.get('flower') || 'lilac' };
  }

  function updateLink() {
    linkField.value = cardUrl();
    counter.textContent = Array.from(form.elements.msg.value).length;
  }

  function openComposer() {
    form.elements.to.value = draft.to;
    form.elements.msg.value = draft.msg;
    form.elements.from.value = draft.from;
    form.elements.flower.value = draft.flower;
    hero.classList.add('is-settled');
    render(draft);
    updateLink();
    dialog.returnValue = '';
    dialog.showModal();
  }

  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    clearTimeout(toastTimer);
    if (!toast.matches(':popover-open')) toast.showPopover();
    toastTimer = setTimeout(() => toast.hidePopover(), 2600);
  }

  form.addEventListener('input', () => {
    draft = readForm();
    render(draft);
    updateLink();
  });
  form.addEventListener('submit', event => event.preventDefault());

  // Closing without previewing puts back the card the link carries
  dialog.addEventListener('close', () => {
    if (dialog.returnValue !== 'preview') render(current);
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  $('[data-close]', dialog).addEventListener('click', () => dialog.close());

  for (const chip of $$('[data-preset]', dialog)) {
    chip.addEventListener('click', () => {
      form.elements.msg.value = TEXT[lang].presets[chip.dataset.preset];
      form.dispatchEvent(new Event('input'));
      form.elements.msg.focus();
    });
  }

  $('[data-preview]', dialog).addEventListener('click', () => {
    const hash = Card.buildHash({ ...draft, lang });
    current = Card.parseCard(hash);
    history.replaceState(null, '', location.pathname + location.search + hash);
    dialog.close('preview');
    replay();
  });

  $('[data-copy]', dialog).addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cardUrl());
      notify(TEXT[lang].copied);
    } catch {
      linkField.focus();
      linkField.select();
      notify(TEXT[lang].copyFailed);
    }
  });

  if (navigator.share) {
    shareButton.hidden = false;
    shareButton.addEventListener('click', () => {
      // Dismissing the share sheet rejects; that is not an error
      navigator.share({ title: document.title, text: TEXT[lang].shareText, url: cardUrl() }).catch(() => {});
    });
  }

  for (const button of $$('[data-compose]')) button.addEventListener('click', openComposer);
  for (const button of $$('[data-replay]')) button.addEventListener('click', replay);
  for (const button of $$('[data-lang]')) button.addEventListener('click', () => setLang(button.dataset.lang, true));

  window.addEventListener('hashchange', () => {
    current = Card.parseCard(location.hash);
    if (current.lang) setLang(current.lang, false);
    replay();
  });

  // ---------- Page chrome ----------

  window.addEventListener('resize', fitBouquet);
  document.fonts?.ready.then(fitBouquet); // the webfonts change how tall the text is

  const topbar = $('.topbar');
  const markScrolled = () => topbar.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', markScrolled, { passive: true });
  markScrolled();

  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      reveal.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  for (const el of $$('.reveal')) reveal.observe(el);

  // ---------- Opening ----------

  setLang(current.lang || lang, false);

  const loaded = new Promise(resolve => (document.readyState === 'complete' ? resolve() : window.addEventListener('load', resolve, { once: true })));
  const fontsReady = Promise.race([document.fonts?.ready, new Promise(resolve => setTimeout(resolve, 1800))]);
  Promise.all([loaded, fontsReady]).then(() => {
    // A short beat on the dark sky before the bloom starts
    setTimeout(() => {
      root.classList.remove('not-loaded');
      window.Sky?.begin();
    }, 400);
  });
})();
