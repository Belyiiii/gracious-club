// ============================
// GRACIOUS CLUB — Main JS
// ============================

document.addEventListener('DOMContentLoaded', () => {

  // --- NAV SCROLL ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  }, { passive: true });

  // --- MOBILE MENU ---
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- SCROLL REVEAL ---
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // --- REVIEWS CAROUSEL ---
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewsPrev');
  const nextBtn = document.getElementById('reviewsNext');
  const dotsContainer = document.getElementById('reviewsDots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const cards = track.querySelectorAll('.review-card');
    let current = 0;
    let startX = 0;
    let isDragging = false;

    // Create dots
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'reviews-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = Math.max(0, Math.min(index, cards.length - 1));
      const card = cards[current];
      const offset = card.offsetLeft - track.parentElement.offsetLeft;
      track.style.transform = `translateX(-${offset}px)`;

      dotsContainer.querySelectorAll('.reviews-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Touch/drag support
    track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; }, { passive: true });
    track.addEventListener('touchmove', () => {}, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }
    });

    // Mouse drag
    track.addEventListener('mousedown', (e) => { startX = e.clientX; isDragging = true; });
    track.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goTo(current + 1) : goTo(current - 1);
      }
    });

    // Auto-play
    let autoPlay = setInterval(() => goTo(current + 1 >= cards.length ? 0 : current + 1), 5000);
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.parentElement.addEventListener('mouseleave', () => {
      autoPlay = setInterval(() => goTo(current + 1 >= cards.length ? 0 : current + 1), 5000);
    });
  }

  // --- LIGHTBOX ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  let galleryImages = [];
  let lightboxIndex = 0;

  document.querySelectorAll('.gallery-item img').forEach((img, i) => {
    galleryImages.push(img.src);
    img.addEventListener('click', () => {
      lightboxIndex = i;
      openLightbox();
    });
  });

  function openLightbox() {
    if (!galleryImages.length) return;
    lightboxImg.src = galleryImages[lightboxIndex];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[lightboxIndex];
  });
  if (lightboxNext) lightboxNext.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % galleryImages.length;
    lightboxImg.src = galleryImages[lightboxIndex];
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
    if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
  });

  // --- COUNTER ANIMATION ---
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        if (!target) return;
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  function animateCounter(el, target) {
    const duration = 1500;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // --- SMOOTH SCROLL for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
