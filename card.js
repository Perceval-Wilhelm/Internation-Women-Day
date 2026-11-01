// The personal card travels in the link's #fragment, which browsers never send to a server.
(function (root) {
  const FLOWERS = ['lilac', 'rose', 'mimosa', 'aqua'];
  const LANGS = ['en', 'vi'];
  const LIMITS = { to: 40, from: 40, msg: 240 };

  // Anyone can craft a link, so treat every field as untrusted text: no control or bidi-override
  // characters, at most one blank line, and a length cap that never splits an emoji.
  function clean(value, max) {
    const text = String(value == null ? '' : value)
      .normalize('NFC')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F​‎‏‪-‮⁦-⁩]/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return Array.from(text).slice(0, max).join('').trim();
  }

  const line = (value, max) => clean(String(value == null ? '' : value).replace(/\s+/g, ' '), max);

  function parseCard(hash) {
    const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    const flower = params.get('f');
    const lang = params.get('lang');
    return {
      to: line(params.get('to'), LIMITS.to),
      from: line(params.get('from'), LIMITS.from),
      msg: clean(params.get('msg'), LIMITS.msg),
      flower: FLOWERS.includes(flower) ? flower : 'lilac',
      lang: LANGS.includes(lang) ? lang : '',
    };
  }

  function buildHash(card) {
    const params = new URLSearchParams();
    const to = line(card.to, LIMITS.to);
    const msg = clean(card.msg, LIMITS.msg);
    const from = line(card.from, LIMITS.from);
    if (to) params.set('to', to);
    if (msg) params.set('msg', msg);
    if (from) params.set('from', from);
    if (!params.toString()) return '';
    if (FLOWERS.includes(card.flower) && card.flower !== 'lilac') params.set('f', card.flower);
    if (LANGS.includes(card.lang)) params.set('lang', card.lang);
    return '#' + params.toString();
  }

  const api = { FLOWERS, LIMITS, parseCard, buildHash };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Card = api;
})(typeof globalThis === 'object' ? globalThis : this);
