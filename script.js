/* =========================================================
   SOKHIA - script.js (version finale)
   En-tête, menu mobile, diaporama (5 s), animations, actualités, formulaire.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 1. En-tête au défilement ---------- */
  var header = document.getElementById('header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Menu mobile ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 820) setMenu(false); });
  }

  /* ---------- 3. Diaporama du Hero (accueil, toutes les 5 secondes) ---------- */
  var slidesBox = document.getElementById('heroSlides');
  var dotsBox = document.getElementById('heroDots');
  if (slidesBox && dotsBox) {
    var slides = slidesBox.querySelectorAll('.hero-slide');
    var current = 0, timer = null;
    var DELAY = 5000; // 5 secondes

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', 'Image ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function () { showSlide(i); restart(); });
      dotsBox.appendChild(dot);
    });
    var dots = dotsBox.querySelectorAll('button');

    function showSlide(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }
    function start() { timer = setInterval(function () { showSlide(current + 1); }, DELAY); }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }
    start();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else restart(); });
  }

  /* ---------- 4. Apparition au défilement ---------- */
  var observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); observer.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  function watch(el) { if (observer) observer.observe(el); else el.classList.add('visible'); }
  document.querySelectorAll('.reveal').forEach(watch);

  /* ---------- 5. Actualités ---------- */
  function getNews() {
    var list = Array.isArray(window.ACTUALITES) ? window.ACTUALITES.slice() : [];
    list.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    return list;
  }
  function formatDate(v) {
    var d = new Date(v);
    return isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function createNewsCard(item, i, onOpen) {
    var card = document.createElement('article');
    card.className = 'card news-card reveal';
    card.style.setProperty('--d', (Math.min(i, 5) * 0.1) + 's');

    var imgBox = document.createElement('div');
    imgBox.className = 'news-img';
    var cat = document.createElement('span');
    cat.className = 'news-cat';
    cat.textContent = item.categorie || 'Actualité';
    imgBox.appendChild(cat);
    if (item.image) {
      var img = document.createElement('img');
      img.src = item.image; img.alt = item.titre || ''; img.loading = 'lazy';
      img.onerror = function () { img.remove(); };
      imgBox.appendChild(img);
    }

    var body = document.createElement('div');
    body.className = 'news-body';
    var date = document.createElement('p');
    date.className = 'news-date';
    date.textContent = formatDate(item.date);
    var title = document.createElement('h3');
    title.textContent = item.titre || '';
    var summary = document.createElement('p');
    summary.textContent = item.resume || '';

    var action;
    if (onOpen) {
      action = document.createElement('button');
      action.type = 'button';
      action.addEventListener('click', function () { onOpen(item, action); });
    } else {
      action = document.createElement('a');
      action.href = 'actualites.html';
    }
    action.className = 'card-link';
    action.innerHTML = 'Lire la suite <span aria-hidden="true">→</span>';

    body.appendChild(date); body.appendChild(title); body.appendChild(summary); body.appendChild(action);
    card.appendChild(imgBox); card.appendChild(body);
    return card;
  }

  /* Accueil : 3 dernières actualités */
  var homeNews = document.getElementById('homeNews');
  if (homeNews) {
    var latest = getNews().slice(0, 3);
    if (!latest.length) {
      homeNews.innerHTML = '<p class="empty-msg">Aucune actualité pour le moment.</p>';
    } else {
      latest.forEach(function (item, i) {
        var c = createNewsCard(item, i, null);
        homeNews.appendChild(c);
        watch(c);
      });
    }
  }

  /* Page Actualités : filtres et fenêtre de détail */
  var newsGrid = document.getElementById('newsGrid');
  var filtersBox = document.getElementById('newsFilters');
  var modal = document.getElementById('newsModal');
  if (newsGrid && filtersBox) {
    var allNews = getNews();
    var activeCat = 'Toutes';
    var lastFocus = null;
    var mImg = document.getElementById('modalImg');
    var mCat = document.getElementById('modalCat');
    var mDate = document.getElementById('modalDate');
    var mTitle = document.getElementById('modalTitle');
    var mText = document.getElementById('modalText');
    var mClose = document.getElementById('modalClose');

    function openModal(item, trigger) {
      lastFocus = trigger || null;
      mImg.innerHTML = '';
      if (item.image) {
        var im = document.createElement('img');
        im.src = item.image; im.alt = item.titre || '';
        im.onerror = function () { im.remove(); };
        mImg.appendChild(im);
      }
      mCat.textContent = item.categorie || 'Actualité';
      mDate.textContent = formatDate(item.date);
      mTitle.textContent = item.titre || '';
      mText.textContent = item.contenu || item.resume || '';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
      mClose.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    if (modal) {
      mClose.addEventListener('click', closeModal);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
    }

    function renderGrid() {
      newsGrid.innerHTML = '';
      var shown = allNews.filter(function (n) { return activeCat === 'Toutes' || n.categorie === activeCat; });
      if (!shown.length) {
        newsGrid.innerHTML = '<p class="empty-msg">Aucune actualité dans cette catégorie pour le moment.</p>';
        return;
      }
      shown.forEach(function (item, i) {
        var c = createNewsCard(item, i, openModal);
        newsGrid.appendChild(c);
        watch(c);
      });
    }

    var cats = ['Toutes'];
    allNews.forEach(function (n) { if (n.categorie && cats.indexOf(n.categorie) === -1) cats.push(n.categorie); });
    cats.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn' + (c === activeCat ? ' active' : '');
      btn.textContent = c;
      btn.addEventListener('click', function () {
        activeCat = c;
        filtersBox.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderGrid();
      });
      filtersBox.appendChild(btn);
    });
    if (!allNews.length) filtersBox.style.display = 'none';
    renderGrid();
  }

  /* ---------- 6. Formulaire de contact ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var CONTACT_EMAIL = 'sokhia.contact@gmail.com';
    // Si un jour vous configurez un service de réception (ex : Formspree), collez son adresse ici.
    // Tant que c'est vide, le formulaire ouvre l'application de messagerie du visiteur.
    var FORM_ENDPOINT = '';

    var status = document.getElementById('formStatus');
    var submitBtn = form.querySelector('button[type="submit"]');
    function showStatus(msg) { status.textContent = msg; status.classList.add('show'); }

    function validateField(f) {
      var wrap = f.closest('.field');
      var v = f.value.trim();
      var ok = true;
      if (f.required && v === '') ok = false;
      if (ok && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
      wrap.classList.toggle('invalid', !ok);
      f.setAttribute('aria-invalid', String(!ok));
      return ok;
    }
    form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('invalid')) validateField(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.remove('show');
      var valid = true, firstInvalid = null;
      form.querySelectorAll('input, textarea').forEach(function (f) {
        if (!validateField(f)) { valid = false; if (!firstInvalid) firstInvalid = f; }
      });
      if (!valid) { showStatus('Veuillez corriger les champs signalés.'); firstInvalid.focus(); return; }

      if (!FORM_ENDPOINT) {
        var nom = form.elements.nom.value.trim();
        var mail = form.elements.email.value.trim();
        var sujet = form.elements.sujet.value.trim();
        var msg = form.elements.message.value.trim();
        var corps = 'Nom : ' + nom + '\nE-mail : ' + mail + '\n\n' + msg;
        window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(sujet) + '&body=' + encodeURIComponent(corps);
        showStatus("Votre application de messagerie va s'ouvrir avec votre message prêt à envoyer. Si rien ne s'ouvre, écrivez-nous directement à " + CONTACT_EMAIL + ".");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours…';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (r) {
          if (!r.ok) throw new Error('Erreur serveur');
          form.reset();
          showStatus('Merci ! Votre message a bien été envoyé.');
        })
        .catch(function () { showStatus("Une erreur est survenue : votre message n'a pas pu être envoyé. Écrivez-nous à " + CONTACT_EMAIL + "."); })
        .finally(function () { submitBtn.disabled = false; submitBtn.textContent = 'Envoyer le message'; });
    });
  }

  /* ---------- 7. Année du pied de page ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});