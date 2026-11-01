// The living sky: twinkling stars, shooting stars, fireflies that drift toward the pointer,
// and a flower that blooms wherever you tap, then lets its petals fall.
(() => {
  const hero = document.querySelector('.hero');
  const canvas = hero.querySelector('.fx');
  const ctx = canvas.getContext('2d');
  const meteor = hero.querySelector('.shooting-star');
  const hint = hero.querySelector('[data-hint]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const TAU = Math.PI * 2;
  const OPEN_MS = 900;
  const HOLD_MS = 2600;

  const flies = [];
  const blooms = [];
  const bits = [];
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let dpr = 1;
  let started = false;
  let running = false;
  let onScreen = true;
  let startedAt = 0;
  let last = 0;
  let theme = null;
  let themeKey = '';
  let glowSprite = null;
  let goldSprite = null;

  const rand = (min, max) => min + Math.random() * (max - min);
  const easeOutBack = t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

  // Stars are box-shadows on four tiny elements, so the browser twinkles them without any JS per frame.
  function scatterStars() {
    const tints = ['255 250 255', '233 213 255', '255 236 200', '210 230 255'];
    hero.querySelectorAll('.stars i').forEach((layer, index) => {
      const shadows = [];
      for (let i = 0; i < [110, 60, 26, 12][index]; i++) {
        const x = rand(0, 100).toFixed(2);
        const y = (Math.random() ** 1.4 * 75).toFixed(2);
        shadows.push(`${x}vw ${y}vh rgb(${tints[i % tints.length]} / ${rand(0.45, 1).toFixed(2)})`);
      }
      layer.style.boxShadow = shadows.join(',');
    });
  }

  // Canvas colours: let the 2D context normalise any CSS colour, then read back its channels.
  const probe = document.createElement('canvas').getContext('2d');
  function channels(color) {
    probe.fillStyle = '#fff';
    probe.fillStyle = color;
    const value = probe.fillStyle;
    if (value[0] === '#') return [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
    return value.match(/[\d.]+/g).slice(0, 3).map(Number);
  }
  const rgba = (c, alpha) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;

  function sprite(color) {
    const size = 64;
    const image = document.createElement('canvas');
    image.width = image.height = size;
    const g = image.getContext('2d');
    const glow = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    glow.addColorStop(0, 'rgba(255, 255, 255, 1)');
    glow.addColorStop(0.2, rgba(color, 0.9));
    glow.addColorStop(0.5, rgba(color, 0.25));
    glow.addColorStop(1, rgba(color, 0));
    g.fillStyle = glow;
    g.fillRect(0, 0, size, size);
    return image;
  }

  // Cheap to call on every tap; sprites are only rebuilt when the flower colours actually changed.
  function readTheme() {
    const style = getComputedStyle(hero);
    const values = ['--petal-a', '--petal-b', '--petal-c', '--glow', '--spark-a', '--core-a'].map(name => style.getPropertyValue(name).trim() || '#fff');
    const key = values.join();
    if (key === themeKey) return;
    themeKey = key;
    const [a, b, c, glow, spark, core] = values.map(channels);
    theme = { a, b, c, glow, spark, core };
    glowSprite = sprite(glow);
    goldSprite = sprite(spark);
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (rect.width === width && rect.height === height && ratio === dpr) return;
    width = rect.width;
    height = rect.height;
    dpr = ratio;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const count = Math.round(Math.min(46, (width * height) / 24000));
    while (flies.length < count) flies.push(makeFly(true));
    flies.length = count;
  }

  function makeFly(anywhere) {
    return {
      x: rand(0, width),
      y: anywhere ? rand(height * 0.2, height) : height + 20,
      vx: 0,
      vy: 0,
      size: rand(5, 13),
      seed: rand(0, 1000),
      lift: rand(0.08, 0.28),
      gold: Math.random() < 0.55,
    };
  }

  function moveFly(f, now, dt) {
    const wander = (now + f.seed * 37) * 0.0006;
    f.vx += Math.sin(wander + f.seed) * 0.018 * dt;
    f.vy += (Math.cos(wander * 1.3 + f.seed) * 0.014 - f.lift * 0.02) * dt;
    if (pointer.active) {
      const dx = pointer.x - f.x;
      const dy = pointer.y - f.y;
      const d = Math.hypot(dx, dy);
      if (d > 1 && d < 200) {
        // Curious, not clingy: drawn in from afar, nudged away up close
        const pull = d < 40 ? -0.06 : 0.035 * (1 - d / 200);
        f.vx += (dx / d) * pull * dt;
        f.vy += (dy / d) * pull * dt;
      }
    }
    const drag = 0.965 ** dt;
    f.vx *= drag;
    f.vy *= drag;
    f.x += f.vx * dt;
    f.y = Math.min(f.y + f.vy * dt, height + 40);
    if (f.y < -30 || f.x < -30 || f.x > width + 30) Object.assign(f, makeFly(false));
  }

  function drawFly(f, now, fadeIn) {
    const flicker = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((now + f.seed * 50) * 0.003));
    const s = f.size * (0.8 + flicker * 0.4);
    ctx.globalAlpha = flicker * fadeIn;
    ctx.drawImage(f.gold ? goldSprite : glowSprite, f.x - s, f.y - s, s * 2, s * 2);
  }

  function petalPath(length, half) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(half, -length * 0.25, half * 0.9, -length * 0.85, 0, -length);
    ctx.bezierCurveTo(-half * 0.9, -length * 0.85, -half, -length * 0.25, 0, 0);
  }

  function drawRing(count, length, half, base, tip, offset) {
    if (length <= 0) return;
    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.rotate(offset + (i / count) * TAU);
      const fill = ctx.createLinearGradient(0, 0, 0, -length);
      fill.addColorStop(0, rgba(base, 0.96));
      fill.addColorStop(1, rgba(tip, 0.96));
      ctx.fillStyle = fill;
      petalPath(length, half);
      ctx.fill();
      ctx.restore();
    }
  }

  function bloomAt(x, y) {
    if (!started || calm.matches) return;
    readTheme();
    const unit = Math.min(width, height);
    blooms.push({ x, y, born: performance.now(), r: unit * rand(0.045, 0.07), petals: 5 + Math.floor(rand(0, 3)), turn: rand(0, TAU), spin: rand(-1, 1) * 0.00025, colors: theme });
    if (blooms.length > 12) blooms.shift();
    for (let i = 0; i < 18; i++) {
      const angle = rand(0, TAU);
      const speed = rand(1.2, 4.2);
      bits.push({ kind: 'spark', x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.6, age: 0, life: rand(40, 80), size: rand(3, 7), gold: Math.random() < 0.6 });
    }
    if (bits.length > 400) bits.splice(0, bits.length - 400);
    hint?.classList.add('is-done');
    start();
  }

  function drawBloom(b, now) {
    const age = now - b.born;
    const progress = Math.min(age / OPEN_MS, 1);
    const r = b.r * easeOutBack(progress) * (1 + Math.sin(age * 0.004) * 0.025 * progress);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.turn + age * b.spin);
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.55 * progress;
    ctx.drawImage(glowSprite, -r * 2.4, -r * 2.4, r * 4.8, r * 4.8);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    drawRing(b.petals, r, r * 0.52, b.colors.a, b.colors.b, 0);
    drawRing(b.petals, r * 0.62, r * 0.36, b.colors.c, b.colors.b, Math.PI / b.petals);
    if (r > 0) {
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.22);
      core.addColorStop(0, '#fffbea');
      core.addColorStop(0.6, rgba(b.colors.core, 1));
      core.addColorStop(1, rgba(b.colors.core, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // When a bloom is done, its petals come loose and flutter down.
  function release(b, now) {
    const turn = b.turn + (now - b.born) * b.spin;
    for (let i = 0; i < b.petals; i++) {
      const angle = turn + (i / b.petals) * TAU - Math.PI / 2;
      const push = rand(0.6, 1.6);
      bits.push({
        kind: 'petal',
        x: b.x + Math.cos(angle) * b.r * 0.55,
        y: b.y + Math.sin(angle) * b.r * 0.55,
        vx: Math.cos(angle) * push,
        vy: Math.sin(angle) * push - rand(0.4, 1.2),
        age: 0,
        life: rand(150, 220),
        size: b.r * rand(0.55, 0.8),
        turn: angle + Math.PI / 2,
        spin: rand(-0.04, 0.04),
        flip: rand(0, TAU),
        flipSpeed: rand(0.04, 0.09),
        sway: rand(0, TAU),
        colors: b.colors,
      });
    }
  }

  function moveBit(p, dt) {
    p.age += dt;
    if (p.kind === 'spark') {
      const drag = 0.94 ** dt;
      p.vx *= drag;
      p.vy = p.vy * drag + 0.03 * dt;
    } else {
      p.sway += 0.03 * dt;
      p.vx = p.vx * 0.985 ** dt + Math.sin(p.sway) * 0.03 * dt;
      p.vy = Math.min(p.vy + 0.025 * dt, 1.3); // petals float down; they don't drop
      p.turn += p.spin * dt;
      p.flip += p.flipSpeed * dt;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    return p.age < p.life && p.y < height + 60;
  }

  function drawBit(p) {
    const t = p.age / p.life;
    if (p.kind === 'spark') {
      const s = p.size * (1 - t * 0.6);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(p.gold ? goldSprite : glowSprite, p.x - s, p.y - s, s * 2, s * 2);
      ctx.globalCompositeOperation = 'source-over';
      return;
    }
    ctx.globalAlpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.turn);
    ctx.scale(1, Math.cos(p.flip)); // squashing the petal on one axis reads as it tumbling in 3D
    ctx.translate(0, p.size / 2);
    const fill = ctx.createLinearGradient(0, 0, 0, -p.size);
    fill.addColorStop(0, rgba(p.colors.a, 0.95));
    fill.addColorStop(1, rgba(p.colors.b, 0.95));
    ctx.fillStyle = fill;
    petalPath(p.size, p.size * 0.5);
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 16.667, 3);
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const fadeIn = Math.min((now - startedAt) / 2500, 1);
    ctx.globalCompositeOperation = 'lighter';
    for (const f of flies) {
      moveFly(f, now, dt);
      drawFly(f, now, fadeIn);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;

    for (let i = 0; i < blooms.length; i++) {
      if (now - blooms[i].born > HOLD_MS) release(blooms.splice(i--, 1)[0], now);
      else drawBloom(blooms[i], now);
    }
    for (let i = 0; i < bits.length; i++) {
      if (moveBit(bits[i], dt)) drawBit(bits[i]);
      else bits.splice(i--, 1);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || !started || !onScreen || document.hidden || calm.matches) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
  }

  function shootLater() {
    setTimeout(shoot, rand(4000, 11000));
  }

  function shoot() {
    if (running && meteor.animate) {
      const x = rand(0.08, 0.7) * width;
      const y = rand(0.04, 0.3) * height;
      const angle = rand(14, 34);
      const distance = rand(220, 420);
      const rad = (angle * Math.PI) / 180;
      meteor.animate(
        [
          { transform: `translate(${x}px, ${y}px) rotate(${angle}deg) scaleX(0.2)`, opacity: 0 },
          { opacity: 1, offset: 0.2 },
          { transform: `translate(${x + Math.cos(rad) * distance}px, ${y + Math.sin(rad) * distance}px) rotate(${angle}deg) scaleX(1)`, opacity: 0 },
        ],
        { duration: rand(900, 1500), easing: 'cubic-bezier(.35, 0, .65, 1)' },
      );
    }
    shootLater();
  }

  // main.js calls this once the page is ready to bloom.
  function begin() {
    if (started) return;
    started = true;
    startedAt = performance.now();
    resize();
    readTheme();
    start();
    if (!calm.matches) shootLater();
  }

  function localPoint(event) {
    const rect = hero.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  hero.addEventListener('pointerdown', event => {
    if (event.button > 0 || event.target.closest('a, button, input, textarea, label, .card')) return;
    bloomAt(...localPoint(event));
  });
  hero.addEventListener('pointermove', event => {
    [pointer.x, pointer.y] = localPoint(event);
    pointer.active = true;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) start();
    else stop();
  }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  window.addEventListener('resize', () => started && resize());

  scatterStars();

  window.Sky = {
    begin,
    bloomAt,
    // Fireflies pick up new flower colours once the CSS cross-fade has finished
    refreshTheme: () => setTimeout(readTheme, 1300),
  };
})();
