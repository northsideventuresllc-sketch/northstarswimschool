/* ===== North-Stars Swim School — interactions ===== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Current year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky nav shadow ---- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Starfield ---- */
  var field = document.getElementById('starfield');
  if (field && !reduceMotion) {
    var count = window.innerWidth < 640 ? 40 : 80;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      var size = Math.random() * 2.4 + 0.8;
      s.style.width = s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 78 + '%';
      s.style.setProperty('--dur', (Math.random() * 4 + 2.5) + 's');
      s.style.animationDelay = (Math.random() * 4) + 's';
      frag.appendChild(s);
    }
    field.appendChild(frag);
  }

  /* ---- Countdown to launch (Aug 1, 2026, local time) ---- */
  var LAUNCH = new Date(2026, 7, 1, 9, 0, 0); // month is 0-indexed -> 7 = August
  var el = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs')
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var diff = LAUNCH.getTime() - Date.now();
    if (diff <= 0) {
      if (el.days) el.days.textContent = '00';
      if (el.hours) el.hours.textContent = '00';
      if (el.mins) el.mins.textContent = '00';
      if (el.secs) el.secs.textContent = '00';
      var badge = document.querySelector('.hero__badge');
      if (badge) badge.innerHTML = '<span class="hero__badge-dot"></span> We are <strong>live</strong> — registration open!';
      return false;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var sc = Math.floor((diff % 60000) / 1000);
    if (el.days) el.days.textContent = pad(d);
    if (el.hours) el.hours.textContent = pad(h);
    if (el.mins) el.mins.textContent = pad(m);
    if (el.secs) el.secs.textContent = pad(sc);
    return true;
  }
  if (el.days) {
    tick();
    var timer = setInterval(function () {
      if (tick() === false) clearInterval(timer);
    }, 1000);
  }

  /* ---- Reveal on scroll + count-up stats ---- */
  var revealEls = document.querySelectorAll('.reveal');
  function countUp(node) {
    var target = parseInt(node.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { node.textContent = target; return; }
    var start = 0, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.floor(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        entry.target.querySelectorAll('.stat__num[data-count]').forEach(countUp);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (e) { io.observe(e); });
  } else {
    revealEls.forEach(function (e) { e.classList.add('in'); });
    document.querySelectorAll('.stat__num[data-count]').forEach(countUp);
  }

  /* ---- Notify form (client-side; stores locally until backend is wired) ---- */
  var form = document.getElementById('notifyForm');
  var note = document.getElementById('notifyNote');
  var input = document.getElementById('notifyEmail');
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = (input.value || '').trim();
      if (!validEmail(val)) {
        note.textContent = 'Please enter a valid email address.';
        note.className = 'notify__note err';
        input.focus();
        return;
      }
      // Persist locally; a backend (Kit / Supabase) can pick these up later.
      try {
        var list = JSON.parse(localStorage.getItem('nsss_waitlist') || '[]');
        if (list.indexOf(val) === -1) list.push(val);
        localStorage.setItem('nsss_waitlist', JSON.stringify(list));
      } catch (err) { /* storage unavailable — non-fatal */ }
      note.textContent = "You're on the list! We'll email you the moment registration opens. ⭐";
      note.className = 'notify__note ok';
      form.reset();
    });
  }

  /* ---- Parallax crest (subtle) ---- */
  var crest = document.getElementById('heroCrest');
  if (crest && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', function (ev) {
      var x = (ev.clientX / window.innerWidth - 0.5) * 14;
      var y = (ev.clientY / window.innerHeight - 0.5) * 14;
      crest.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
  }
})();
