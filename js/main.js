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

  /* ---- Notify form ----------------------------------------------------
     Posts to the nsss-waitlist edge function, which writes the signup to
     NI-Brain (public.nsss_waitlist) and emails JB via Resend.

     Previously this only did localStorage.setItem('nsss_waitlist', ...) and
     showed the success message unconditionally — nothing ever read that key,
     so every signup died in the visitor's own browser. localStorage is now
     only an offline queue, replayed on the next successful load.
  --------------------------------------------------------------------- */
  var WAITLIST_ENDPOINT = 'https://kxijunwgbrlfzvgkhklo.supabase.co/functions/v1/nsss-waitlist';
  var PENDING_KEY = 'nsss_waitlist_pending';

  var form = document.getElementById('notifyForm');
  var note = document.getElementById('notifyNote');
  var input = document.getElementById('notifyEmail');
  var honeypot = document.getElementById('notifyCompany');
  var submitBtn = document.getElementById('notifySubmit');
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function readPending() {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }
    catch (err) { return []; }
  }
  function writePending(list) {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); }
    catch (err) { /* storage unavailable — non-fatal */ }
  }
  function queueOffline(email) {
    var list = readPending();
    if (list.indexOf(email) === -1) list.push(email);
    writePending(list);
  }

  function postSignup(email) {
    return fetch(WAITLIST_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        source: 'website',
        page_url: window.location.href,
        referrer: document.referrer || null,
        company: honeypot ? honeypot.value : ''
      })
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok || !data.ok) {
          var err = new Error((data && data.error) || ('http_' + res.status));
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  /* Recover the dead era: signups made before this fix only ever existed in the
     visitor's own localStorage under 'nsss_waitlist'. Most are unrecoverable
     (they live on devices that may never return), but if a past signer-upper
     loads the site again we can still rescue their address. Queue it, don't
     drop it. */
  function migrateLegacy() {
    var legacy;
    try { legacy = JSON.parse(localStorage.getItem('nsss_waitlist') || '[]'); }
    catch (err) { return; }
    if (!legacy || !legacy.length) return;
    var pending = readPending();
    legacy.forEach(function (email) {
      if (validEmail(email) && pending.indexOf(email) === -1) pending.push(email);
    });
    writePending(pending);
    try { localStorage.removeItem('nsss_waitlist'); } catch (err) { /* non-fatal */ }
  }
  migrateLegacy();

  // Replay anything captured while the endpoint was unreachable.
  function flushPending() {
    var list = readPending();
    if (!list.length) return;
    var remaining = [];
    var done = 0;
    list.forEach(function (email) {
      postSignup(email)
        .catch(function () { remaining.push(email); })
        .then(function () {
          if (++done === list.length) writePending(remaining);
        });
    });
  }
  flushPending();

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

      if (submitBtn) { submitBtn.disabled = true; }
      note.textContent = 'Adding you to the list…';
      note.className = 'notify__note';

      postSignup(val).then(function () {
        // Success message only after the signup actually landed.
        note.textContent = "You're on the list! We'll email you the moment registration opens. ⭐";
        note.className = 'notify__note ok';
        form.reset();
      }).catch(function (err) {
        if (err && err.message === 'invalid_email') {
          note.textContent = 'Please enter a valid email address.';
          note.className = 'notify__note err';
          input.focus();
          return;
        }
        // Network/server failure: keep it locally and retry on the next visit,
        // and tell the parent the truth instead of a fake confirmation.
        queueOffline(val);
        note.textContent = "We couldn't reach the server. We've saved your email and will retry — " +
          'or email hello@northstarsswimschool.org and we\'ll add you by hand.';
        note.className = 'notify__note err';
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; }
      });
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
