// Run with: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCard, buildHash, LIMITS } = require('../card.js');

test('a Vietnamese card survives the round trip through a link', () => {
  const card = { to: 'Mẹ yêu', from: 'Thịnh', msg: 'Con yêu mẹ nhiều lắm!\nChúc mẹ 8/3 thật vui 💐', flower: 'rose', lang: 'vi' };
  assert.deepEqual(parseCard(buildHash(card)), card);
});

test('an empty card makes no link, and no link makes an empty card', () => {
  assert.equal(buildHash({ to: '  ', msg: '\n', from: '', flower: 'mimosa', lang: 'vi' }), '');
  assert.deepEqual(parseCard(''), { to: '', from: '', msg: '', flower: 'lilac', lang: '' });
});

test('markup stays plain text; control and bidi-override characters are dropped', () => {
  const card = parseCard('#to=' + encodeURIComponent('<img src=x onerror=alert(1)>‮') + '&from=a%00b');
  assert.equal(card.to, '<img src=x onerror=alert(1)>');
  assert.equal(card.from, 'ab');
});

test('lengths are capped by character without splitting an emoji', () => {
  const card = parseCard('#msg=' + encodeURIComponent('💐'.repeat(LIMITS.msg + 10)));
  assert.equal(Array.from(card.msg).length, LIMITS.msg);
  assert.ok(card.msg.endsWith('💐'));
});

test('unknown flowers and languages fall back to the defaults', () => {
  const card = parseCard('#to=Lan&f=javascript:alert(1)&lang=xx');
  assert.equal(card.flower, 'lilac');
  assert.equal(card.lang, '');
});

test('names collapse to one line; messages keep at most one blank line', () => {
  const card = parseCard('#to=' + encodeURIComponent('Lan\n\nAnh') + '&msg=' + encodeURIComponent('a\n\n\n\nb'));
  assert.equal(card.to, 'Lan Anh');
  assert.equal(card.msg, 'a\n\nb');
});

test('malformed percent-escapes do not throw', () => {
  assert.equal(parseCard('#to=%E0%A4%A&msg=%').to.length > 0, true);
});
