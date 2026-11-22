/* =========================================================
   SOKHIA - extras.js (version finale) - PARTIE A
   Chargement, progression, boutons, transitions, bulles, vagues, titre qui s'écrit, cartes 3D
   ========================================================= */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- WHATSAPP : pour afficher le bouton, mettez votre numéro WhatsApp (sans + ni espaces) ----
  // Exemple : '242067301755'. Laissé vide, le bouton n'apparaît pas.
  var WHATSAPP_NUMBER = '';
  var WHATSAPP_MESSAGE = 'Bonjour SOKHIA,';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  /* Écran de chargement (une fois par visite) */
  try {
    if (!reduced && !sessionStorage.getItem('sokhiaLoaded')) {
      var loader = el('div', 'loader', '<div class="loader-inner"><img src="assets/logo/sokhia-logo.jpg" alt=""><div class="loader-bar"></div></div>');
      loader.setAttribute('aria-hidden', 'true');
      document.body.appendChild(loader);
      var hide = function () { loader.classList.add('hide'); setTimeout(function () { loader.remove(); }, 600); };
      if (document.readyState === 'complete') setTimeout(hide, 300);
      else { window.addEventListener('load', function () { setTimeout(hide, 300); }); setTimeout(hide, 3000); }
      sessionStorage.setItem('sokhiaLoaded', '1');
    }
  } catch (e) {}

  /* Barre de progression et retour en haut */
  var bar = el('div', 'progress');
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var topBtn = el('button', 'fab fab-top', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"/></svg>');
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', 'Retour en haut de la page');
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  document.body.appendChild(topBtn);

  var ticking = false;
  function update() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
    topBtn.classList.toggle('show', window.scrollY > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  /* Bouton WhatsApp */
  if (WHATSAPP_NUMBER) {
    var wa = el('a', 'fab fab-wa', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>');
    wa.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'Écrire à SOKHIA sur WhatsApp');
    document.body.appendChild(wa);
  }

  /* Transition douce entre les pages */
  if (!reduced) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (x) { return; }
      if (url.protocol !== location.protocol || url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function () { location.href = url.href; }, 250);
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted) document.body.classList.remove('leaving'); });
  }

  /* Bulles flottantes */
  function addBubbles(host, count) {
    var box = el('div', 'bubbles');
    box.setAttribute('aria-hidden', 'true');
    var colors = ['rgba(240,95,47,.30)', 'rgba(255,255,255,.18)', 'rgba(100,32,208,.35)'];
    for (var i = 0; i < count; i++) {
      var b = el('span', 'bubble');
      var s = 50 + Math.random() * 150;
      b.style.width = s + 'px'; b.style.height = s + 'px';
      b.style.left = (Math.random() * 95) + '%';
      b.style.setProperty('--t', (16 + Math.random() * 16) + 's');
      b.style.setProperty('--dl', '-' + (Math.random() * 20) + 's');
      b.style.setProperty('--dx', ((Math.random() - 0.5) * 120) + 'px');
      b.style.setProperty('--c', colors[i % 3]);
      box.appendChild(b);
    }
    host.insertBefore(box, host.firstChild);
  }
  if (!reduced) {
    var small = window.innerWidth < 700;
    document.querySelectorAll('.hero, .page-hero').forEach(function (h) { addBubbles(h, small ? 5 : 9); });
    document.querySelectorAll('.vision, .cta-box').forEach(function (h) { addBubbles(h, small ? 3 : 5); });
  }

  /* Vagues (couleur = fond de la section suivante) */
  function setWaves() {
    document.querySelectorAll('.hero, .page-hero').forEach(function (host) {
      host.classList.add('has-wave');
      var next = host.nextElementSibling;
      var bg = next ? getComputedStyle(next).backgroundColor : '';
      if (!bg || bg === 'transparent' || bg.indexOf('rgba(0, 0, 0, 0)') === 0) bg = 'var(--page-bg)';
      host.style.setProperty('--wave', bg);
    });
  }
  setWaves();
  window.addEventListener('sokhia-theme', setWaves);

  /* Titre qui s'écrit (Hero de l'accueil) */
  var heroContent = document.querySelector('.hero-content');
  var heroText = heroContent && heroContent.querySelector('.hero-text');
  if (heroContent && heroText) {
    var words = ["le bien-être numérique", "l'innovation", "l'engagement social", "la jeunesse africaine", "l'avenir"];
    var rp = el('p', 'hero-rotator',
      '<span class="sr-only">SOKHIA, c\'est le bien-être numérique, l\'innovation, l\'engagement social, la jeunesse africaine et l\'avenir.</span>' +
      '<span aria-hidden="true">SOKHIA, c\'est <span class="rot-word"></span></span>');
    heroContent.insertBefore(rp, heroText);
    var w = rp.querySelector('.rot-word');
    if (reduced) { w.textContent = words[0]; w.style.borderRight = '0'; }
    else {
      var wi = 0, ci = 0, del = false;
      (function tick() {
        var word = words[wi];
        if (!del) {
          ci++; w.textContent = word.slice(0, ci);
          if (ci === word.length) { del = true; return setTimeout(tick, 1600); }
          return setTimeout(tick, 70);
        }
        ci--; w.textContent = word.slice(0, ci);
        if (ci === 0) { del = false; wi = (wi + 1) % words.length; return setTimeout(tick, 300); }
        return setTimeout(tick, 35);
      })();
    }
  }

  /* Cartes qui s'inclinent en 3D (ordinateur seulement) */
  if (!reduced && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var active = null;
    var reset = function (c) { c.style.transform = ''; c.style.transitionDuration = ''; };
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.card, .vision-card');
      if (c !== active) {
        if (active) reset(active);
        active = c;
        if (c) { c.style.transitionDelay = '0s'; c.style.transitionDuration = '.15s'; }
      }
      if (c) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) translateY(-8px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg)';
      }
    });
    document.documentElement.addEventListener('mouseleave', function () { if (active) { reset(active); active = null; } });
  }
})();



/* =========================================================
   SOKHIA - extras.js (version finale) - PARTIE B
   Mode sombre, réseau de points, illustrations, parallaxe, halo, boutons magnétiques
   ========================================================= */

/* ---- Mode sombre + réseau de points ---- */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  var root = document.documentElement, KEY = 'sokhia-theme';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var themeBtn = el('button', 'fab fab-theme');
  themeBtn.type = 'button';
  document.body.appendChild(themeBtn);

  function isDark() { return root.getAttribute('data-theme') === 'dark'; }
  function refreshBtn() {
    themeBtn.innerHTML = isDark() ? SUN : MOON;
    themeBtn.setAttribute('aria-pressed', String(isDark()));
    themeBtn.setAttribute('aria-label', isDark() ? 'Activer le mode clair' : 'Activer le mode sombre');
  }
  function setTheme(dark, save) {
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    if (save) { try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) {} }
    refreshBtn();
    window.dispatchEvent(new Event('sokhia-theme'));
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  setTheme(saved === 'dark', false);
  themeBtn.addEventListener('click', function () { setTheme(!isDark(), true); });

  var host = document.querySelector('.page-hero');
  if (!host || reduced) return;
  var cv = el('canvas', 'net-canvas');
  cv.setAttribute('aria-hidden', 'true');
  host.insertBefore(cv, host.firstChild);
  var ctx = cv.getContext('2d');
  if (!ctx) return;
  var w = 0, h = 0, pts = [], mouse = { x: -999, y: -999 }, raf = null;

  function size() {
    var r = host.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = w < 700 ? 22 : 46;
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 });
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    var i, j, p, q, d;
    for (i = 0; i < pts.length; i++) {
      p = pts[i]; p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.2832); ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fill();
      for (j = i + 1; j < pts.length; j++) {
        q = pts[j]; d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) {
          ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - d / 130) * 0.35).toFixed(3) + ')'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (d < 160) {
        ctx.strokeStyle = 'rgba(240,95,47,' + ((1 - d / 160) * 0.7).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  size();
  host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  host.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); else stop(); }).observe(host);
  else start();
})();

/* ---- Illustrations (scènes, valeurs, mission/vision, contact) ---- */
(function () {
  'use strict';
  var HEART = 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z';

  var scenes = {
    'bien-etre': '<svg class="il scene" viewBox="0 0 400 300" aria-hidden="true">' +
      '<circle class="s-soft il-pulse" cx="200" cy="150" r="118"/>' +
      '<path class="s-fill" d="M200 172 L172 252 H228 Z"/><path class="s-line" d="M150 252 H250"/>' +
      '<g class="il-rock"><rect class="s-fill" x="62" y="162" width="276" height="9" rx="4.5"/>' +
      '<rect class="s-line" x="86" y="98" width="46" height="64" rx="9"/><path class="s-line" d="M100 112 H118"/>' +
      '<circle class="s-fill" cx="109" cy="148" r="3.5"/><path class="s-ostroke" d="M292 162 V122"/>' +
      '<path class="s-o" d="M292 134 C272 128 264 110 268 98 C286 100 296 114 292 134Z"/>' +
      '<path class="s-o" d="M292 146 C310 142 320 128 316 116 C300 118 290 130 292 146Z"/></g>' +
      '<g transform="translate(184 92) scale(1.35)"><path class="s-o il-pulse" d="' + HEART + '"/></g></svg>',

    'innovation': '<svg class="il scene" viewBox="0 0 400 300" aria-hidden="true">' +
      '<circle class="s-soft il-pulse" cx="200" cy="150" r="108"/>' +
      '<circle class="il-spin" cx="200" cy="150" r="104" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="12" stroke-dasharray="14 10.2"/>' +
      '<g transform="translate(128 80) scale(6)" fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width=".42" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M9 18h6M10 22h4" fill="none"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/></g>' +
      '<circle class="s-o il-pulse" cx="200" cy="128" r="11"/>' +
      '<path class="s-line il-flow" d="M30 120 H70 L90 140 H110"/><path class="s-line il-flow" d="M370 180 H330 L310 160 H290"/>' +
      '<circle class="s-o il-pulse" cx="30" cy="120" r="6"/><circle class="s-o il-pulse" cx="370" cy="180" r="6"/></svg>',

    'impact': '<svg class="il scene" viewBox="0 0 400 300" aria-hidden="true">' +
      '<circle class="s-soft il-pulse" cx="200" cy="158" r="112"/><circle class="s-line" cx="200" cy="158" r="62"/>' +
      '<ellipse class="s-line il-merid" cx="200" cy="158" rx="28" ry="62"/><ellipse class="s-line" cx="200" cy="158" rx="62" ry="22"/>' +
      '<path class="s-line il-flow" d="M92 218 Q120 212 148 192"/><path class="s-line il-flow" d="M308 218 Q280 212 252 192"/><path class="s-line il-flow" d="M200 66 V96"/>' +
      '<g class="s-fill"><g transform="translate(70 198)"><circle r="11"/><path d="M-19 40a19 22 0 0 1 38 0Z"/></g>' +
      '<g transform="translate(330 198)"><circle r="11"/><path d="M-19 40a19 22 0 0 1 38 0Z"/></g>' +
      '<g transform="translate(200 26)"><circle r="11"/><path d="M-19 40a19 22 0 0 1 38 0Z"/></g></g>' +
      '<circle class="s-o il-pulse" cx="148" cy="192" r="5"/><circle class="s-o il-pulse" cx="252" cy="192" r="5"/><circle class="s-o il-pulse" cx="200" cy="96" r="5"/></svg>'
  };
  Object.keys(scenes).forEach(function (id) {
    var host = document.querySelector('#' + id + ' .feature-visual');
    if (host) host.innerHTML = scenes[id];
  });

  function ico(inner) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>'; }
  var valueIcons = [
    ico('<path d="' + HEART + '"/>'),
    ico('<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"/>'),
    ico('<path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>'),
    ico('<path d="M5 22V4M5 4h11l-2 4 2 4H5"/>'),
    ico('<circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1"/><path d="M16 4.5a3.2 3.2 0 0 1 0 6.2M21 20v-1a5 5 0 0 0-3.5-4.8"/>'),
    ico('<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>')
  ];
  document.querySelectorAll('.value').forEach(function (card, i) {
    if (!valueIcons[i]) return;
    var d = document.createElement('div');
    d.className = 'value-ico'; d.innerHTML = valueIcons[i];
    card.insertBefore(d, card.firstChild);
    card.classList.add('has-ico');
  });

  document.querySelectorAll('.vision-card').forEach(function (card) {
    var h = card.querySelector('h3');
    var t = h ? h.textContent.toLowerCase() : '';
    var svg = '';
    if (t.indexOf('mission') > -1) svg = ico('<circle cx="12" cy="12" r="9"/><circle class="il-pulse" cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>');
    else if (t.indexOf('vision') > -1) svg = ico('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle class="il-pulse" cx="12" cy="12" r="3"/>');
    if (svg) { var d = document.createElement('div'); d.className = 'vc-ico'; d.innerHTML = svg; card.insertBefore(d, card.firstChild); }
  });

  var info = document.querySelector('.info-card');
  if (info) {
    var wrap = document.createElement('div');
    wrap.className = 'il-contact';
    wrap.innerHTML = '<svg class="il" viewBox="0 0 400 200" aria-hidden="true">' +
      '<circle class="il-blob" cx="200" cy="100" r="88"/>' +
      '<rect class="il-soft il-pulse" x="50" y="36" width="58" height="36" rx="12"/>' +
      '<rect class="il-o il-pulse" x="292" y="128" width="58" height="36" rx="12" style="animation-delay:-1.4s"/>' +
      '<g class="il-float"><rect class="il-v" x="130" y="70" width="140" height="96" rx="12"/>' +
      '<path d="M136 80 L200 128 L264 80" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '<g class="il-plane"><path class="il-o" d="M0 0 L30 -12 L12 6Z"/><path class="il-o" d="M12 6 L12 17 L19 10Z"/></g></svg>';
    info.insertBefore(wrap, info.firstChild);
  }
})();

/* ---- Parallaxe du Hero, halo lumineux, boutons magnétiques ---- */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hc = document.querySelector('.hero-content');
  if (hc) {
    var tk = false;
    var par = function () {
      var y = window.scrollY, vh = window.innerHeight;
      if (y < vh) {
        hc.style.transform = 'translateY(' + (y * 0.18).toFixed(1) + 'px)';
        hc.style.opacity = String(Math.max(0, 1 - y / (vh * 0.9)));
      }
      tk = false;
    };
    window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(par); } }, { passive: true });
  }

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var glow = document.createElement('div');
  glow.className = 'cursor-glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(glow);
  var gx = 0, gy = 0, pending = false, mb = null;
  document.addEventListener('pointermove', function (e) {
    gx = e.clientX; gy = e.clientY;
    if (!pending) {
      pending = true;
      requestAnimationFrame(function () {
        glow.style.transform = 'translate3d(' + (gx - 210) + 'px,' + (gy - 210) + 'px,0)';
        glow.classList.add('on');
        pending = false;
      });
    }
    var b = e.target.closest && e.target.closest('.btn');
    if (b !== mb) { if (mb) mb.style.transform = ''; mb = b; }
    if (b) {
      var r = b.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.15;
      var dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
      b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + (dy - 3).toFixed(1) + 'px)';
    }
  });
  document.documentElement.addEventListener('mouseleave', function () {
    glow.classList.remove('on');
    if (mb) { mb.style.transform = ''; mb = null; }
  });
})();



/* =========================================================
   SOKHIA - extras.js (version finale) - PARTIE C
   Titres du Hero, réseaux sociaux, partenaires
   ========================================================= */

/* ---- Une grande phrase par photo du Hero ---- */
(function () {
  'use strict';
  var slidesBox = document.getElementById('heroSlides');
  var titles = document.querySelectorAll('#heroTitles .hero-title');
  if (!slidesBox || !titles.length) return;
  var slides = slidesBox.querySelectorAll('.hero-slide');
  function sync() {
    var idx = 0;
    slides.forEach(function (s, i) { if (s.classList.contains('active')) idx = i; });
    titles.forEach(function (t, i) { t.classList.toggle('active', i === idx); });
  }
  new MutationObserver(sync).observe(slidesBox, { attributes: true, subtree: true, attributeFilter: ['class'] });
  sync();
})();

/* ---- Réseaux sociaux : METTEZ VOS LIENS ICI ---- */
(function () {
  'use strict';

  // Remplacez chaque '#' par l'adresse de votre page. Laissez '#' pour garder l'icône sans lien.
  var SOCIALS = [
    { nom: 'Facebook',  url: '#', svg: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>' },
    { nom: 'Instagram', url: '#', svg: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z"/><path d="M17.5 6.5h.01"/>' },
    { nom: 'LinkedIn',  url: '#', svg: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>' },
    { nom: 'X',         url: '#', svg: '<path d="M4 4l16 16M20 4 4 20"/>' },
    { nom: 'YouTube',   url: '#', svg: '<path d="M22.5 6.4a2.8 2.8 0 0 0-1.9-2C18.9 4 12 4 12 4s-6.9 0-8.6.5a2.8 2.8 0 0 0-1.9 2A29 29 0 0 0 1 11.8a29 29 0 0 0 .5 5.3A2.8 2.8 0 0 0 3.4 19c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.8 2.8 0 0 0 1.9-2 29 29 0 0 0 .5-5.2 29 29 0 0 0-.5-5.4z"/><path d="m9.8 15 5.7-3.2L9.8 8.5z"/>' },
    { nom: 'TikTok',    url: '#', svg: '<path d="M9 12a4 4 0 1 0 4 4V3a5 5 0 0 0 5 5"/>' },
    { nom: 'WhatsApp',  url: '#', svg: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>' }
  ];

  document.querySelectorAll('[data-socials]').forEach(function (box) {
    SOCIALS.forEach(function (s) {
      var a = document.createElement('a');
      var hasLink = s.url && s.url !== '#';
      a.href = hasLink ? s.url : '#';
      a.setAttribute('aria-label', s.nom);
      a.title = s.nom;
      if (hasLink) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      else { a.addEventListener('click', function (e) { e.preventDefault(); }); }
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + s.svg + '</svg>';
      box.appendChild(a);
    });
  });
})();

/* ---- Défilement des partenaires (couleurs d'origine, sans doublon visible) ---- */
(function () {
  'use strict';
  var track = document.getElementById('partnersTrack');
  if (!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var view = track.parentElement;

  function build() {
    track.classList.remove('ready');
    Array.prototype.slice.call(track.querySelectorAll('[data-clone]')).forEach(function (n) { n.remove(); });
    var items = Array.prototype.slice.call(track.children);
    if (!items.length) return;

    var imgW = 0;
    items.forEach(function (li) { var im = li.querySelector('img'); if (im) imgW += im.getBoundingClientRect().width; });
    var target = view.clientWidth * 1.1;
    var gap = Math.max(28, (target - imgW) / items.length / 2);
    track.style.setProperty('--pgap', gap + 'px');
    var setW = imgW + items.length * gap * 2;

    items.forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('data-clone', '');
      c.setAttribute('aria-hidden', 'true');
      var im = c.querySelector('img');
      if (im) im.alt = '';
      track.appendChild(c);
    });
    track.style.setProperty('--pdur', Math.max(20, setW / 45).toFixed(1) + 's');
    track.classList.add('ready');
  }

  var imgs = track.querySelectorAll('img');
  var left = imgs.length;
  function done() { left--; if (left <= 0) build(); }
  imgs.forEach(function (im) {
    if (im.complete) done();
    else { im.addEventListener('load', done); im.addEventListener('error', done); }
  });
  window.addEventListener('load', build);
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 250); });
})();