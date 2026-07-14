/* Reflections Productions — main.js
   Nav scroll state, mobile menu, scroll reveals.
   Respects prefers-reduced-motion. No dependencies. */
(function () {
  document.documentElement.classList.add('js');
  'use strict';

  var nav = document.querySelector('nav.site-nav');
  var burger = document.querySelector('.nav-burger');
  var menu = document.querySelector('.mobile-menu');

  /* nav background on scroll */
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 36);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (nav) nav.classList.toggle('solid', open);
      if (!open) onScroll();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        if (nav) nav.classList.remove('solid');
        onScroll();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        if (nav) nav.classList.remove('solid');
        burger.focus();
        onScroll();
      }
    });
  }

  /* hero video: poster covers the load; reduced motion gets the poster only */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hv = document.querySelector('.hero-bg video');
  if (hv) {
    if (reduced) {
      hv.removeAttribute('autoplay');
      try { hv.pause(); } catch (err) {}
    } else {
      var p = hv.play();
      if (p && p.catch) { p.catch(function () {}); }
    }
  }

  /* scroll reveals */
  var els = document.querySelectorAll('.rv');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('on'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('on');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }
})();

/* failsafe: never leave content hidden */
setTimeout(function(){document.querySelectorAll('.rv:not(.on)').forEach(function(e){e.classList.add('on')})},2500);
