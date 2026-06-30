/* ════════════════════════════════════════
   BARBEARIA DO CORTE — script.js
   ════════════════════════════════════════ */

'use strict';

// ── Loader ──────────────────────────────────────
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    triggerHeroReveal();
  }, 1800);
});

// Prevent scroll while loading
document.body.style.overflow = 'hidden';

// ── Custom Cursor ────────────────────────────────
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  const followCursor = () => {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(followCursor);
  };
  followCursor();

  const hoverEls = document.querySelectorAll(
    'a, button, .servico-card, .galeria-item, .diferencial-item, .dep-btn, .dep-dot'
  );
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursorFollower.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hovering'));
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorFollower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '1';
  });
}

// ── Navbar ───────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Smooth Scroll ────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ── Hero Reveal (triggered after loader) ─────────
function triggerHeroReveal() {
  document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, i * 160);
  });
}

// ── Scroll Reveal ────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
  // Skip hero elements – they're triggered by triggerHeroReveal
  if (!el.closest('.hero')) {
    revealObserver.observe(el);
  }
});

// ── Counter Animation ────────────────────────────
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

const countersSection = document.getElementById('counters');
if (countersSection) counterObserver.observe(countersSection);

function animateCounters() {
  document.querySelectorAll('.counter-num').forEach(num => {
    const target = parseInt(num.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      num.textContent = Math.floor(ease * target).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ── Galeria Lightbox ─────────────────────────────
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxBg   = lightbox.querySelector('.lightbox-bg');

document.querySelectorAll('.galeria-item').forEach(item => {
  item.addEventListener('click', () => {
    const src = item.dataset.src;
    if (!src) return;
    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

[lightboxClose, lightboxBg].forEach(el => {
  el.addEventListener('click', closeLightbox);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 400);
}

// ── Depoimentos Slider ───────────────────────────
const depCards  = document.querySelectorAll('.depoimento-card');
const depPrev   = document.getElementById('depPrev');
const depNext   = document.getElementById('depNext');
const depDots   = document.getElementById('depDots');
const isMobile  = () => window.innerWidth < 769;
let depIndex    = 0;

// Build dots
function buildDots() {
  depDots.innerHTML = '';
  const count = isMobile() ? depCards.length : Math.ceil(depCards.length / 3);
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'dep-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    depDots.appendChild(dot);
  }
}

function goTo(i) {
  const count = isMobile() ? depCards.length : Math.ceil(depCards.length / 3);
  depIndex = (i + count) % count;

  if (isMobile()) {
    depCards.forEach((c, idx) => {
      c.style.display = idx === depIndex ? 'flex' : 'none';
    });
  } else {
    // Show all on desktop
    depCards.forEach(c => c.style.display = 'flex');
  }

  depDots.querySelectorAll('.dep-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === depIndex);
  });
}

depPrev.addEventListener('click', () => goTo(depIndex - 1));
depNext.addEventListener('click', () => goTo(depIndex + 1));

buildDots();
goTo(0);

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildDots();
    goTo(0);
  }, 200);
});

// Auto-advance depoimentos
let autoAdv = setInterval(() => goTo(depIndex + 1), 5000);
[depPrev, depNext].forEach(btn => {
  btn.addEventListener('click', () => {
    clearInterval(autoAdv);
    autoAdv = setInterval(() => goTo(depIndex + 1), 5000);
  });
});

// ── Back to Top ──────────────────────────────────
const backTop = document.getElementById('backTop');

window.addEventListener('scroll', () => {
  backTop.classList.toggle('visible', window.scrollY > 600);
}, { passive: true });

backTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Parallax on Hero ─────────────────────────────
const heroImg = document.querySelector('.hero-img');
if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroImg.style.transform = `scale(1.05) translateY(${y * 0.22}px)`;
    }
  }, { passive: true });
}

// ── Lazy Loading polyfill (native if available) ──
if ('loading' in HTMLImageElement.prototype) {
  // Browser supports it natively
} else {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        lazyObs.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => lazyObs.observe(img));
}

// ── Hover Re-register for cursor (dynamic check) ─
// In case of late DOM modifications, re-register hover on cards
document.querySelectorAll('.servico-card, .depoimento-card, .galeria-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorFollower) cursorFollower.classList.add('hovering');
  });
  el.addEventListener('mouseleave', () => {
    if (cursorFollower) cursorFollower.classList.remove('hovering');
  });
});

// ── Keyboard Navigation (accessibility) ──────────
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    document.body.classList.add('using-keyboard');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('using-keyboard');
});
