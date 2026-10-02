// Match the Armoze footer reveal, with a normal-flow fallback for smaller screens.
const revealWindow = document.querySelector('.footer-reveal-window');
const content = document.querySelector('.footer-reveal-content');
const desktopMotion = window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
let enabled = false;
let footerHeight = 0;
let motionFrame = 0;
function updateMotion() {
  motionFrame = 0;
  if (!enabled) return;
  const distance = revealWindow.getBoundingClientRect().bottom - window.innerHeight;
  const progress = Math.max(0, Math.min(1, distance / footerHeight));
  content.style.setProperty('--footer-reveal-offset', `${(progress * footerHeight * .28).toFixed(2)}px`);
}
function queueMotion() {
  if (enabled && !motionFrame) motionFrame = requestAnimationFrame(updateMotion);
}
function updateReveal() {
  footerHeight = Math.ceil(content.getBoundingClientRect().height);
  enabled = desktopMotion.matches && footerHeight > 0 && footerHeight <= window.innerHeight - 80;
  revealWindow.style.setProperty('--footer-reveal-height', `${footerHeight}px`);
  revealWindow.dataset.reveal = String(enabled);
  if (!enabled) content.style.removeProperty('--footer-reveal-offset');
  queueMotion();
}
if (revealWindow && content) {
  new ResizeObserver(updateReveal).observe(content);
  desktopMotion.addEventListener('change', updateReveal);
  window.addEventListener('resize', updateReveal);
  window.addEventListener('scroll', queueMotion, { passive: true });
  content.addEventListener('focusin', (event) => {
    if (!enabled || !event.target.matches(':focus-visible')) return;
    const bounds = revealWindow.getBoundingClientRect();
    if (bounds.bottom > window.innerHeight || bounds.top < 0) {
      revealWindow.scrollIntoView({ block: 'end', behavior: 'instant' });
      content.style.setProperty('--footer-reveal-offset', '0px');
      content.getAnimations().forEach((animation) => animation.finish());
    }
  });
  updateReveal();
}
document.querySelector('#copyright-year').textContent = new Date().getFullYear();

// DOM port of Armoze's MobileNavigationSheet and useStorefrontTopChromeState.
const menuToggle = document.querySelector('.menu-toggle');
const navigationOverlay = document.querySelector('.navigation-sheet-overlay');
const navigationSheet = document.querySelector('.navigation-sheet');
const chrome = document.querySelector('.site-chrome');
const header = document.querySelector('.site-header');
let menuOpen = false;
let previousFocus = null;
function closeMenu(returnFocus = true) {
  if (!menuOpen) return;
  menuOpen = false;
  navigationOverlay.classList.remove('is-open');
  navigationOverlay.inert = true;
  navigationOverlay.setAttribute('aria-hidden', 'true');
  navigationSheet.removeAttribute('aria-modal');
  document.body.classList.remove('mobile-menu-lock');
  document.querySelector('main').inert = false;
  document.querySelector('.site-footer').inert = false;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) previousFocus?.focus({ preventScroll: true });
}
menuToggle.addEventListener('click', () => {
  if (menuOpen) { closeMenu(); return; }
  previousFocus = document.activeElement;
  menuOpen = true;
  chrome.classList.remove('is-hidden');
  navigationOverlay.inert = false;
  navigationOverlay.setAttribute('aria-hidden', 'false');
  navigationSheet.setAttribute('aria-modal', 'true');
  navigationOverlay.classList.add('is-open');
  document.body.classList.add('mobile-menu-lock');
  document.querySelector('main').inert = true;
  document.querySelector('.site-footer').inert = true;
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close navigation');
  navigationSheet.querySelector('button').focus({ preventScroll: true });
});
document.querySelector('.navigation-sheet-handle').addEventListener('click', () => closeMenu());
document.querySelector('.navigation-sheet-scrim').addEventListener('click', () => closeMenu());
navigationSheet.addEventListener('click', (event) => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', (event) => {
  if (!menuOpen) return;
  if (event.key === 'Escape') { closeMenu(); return; }
  if (event.key !== 'Tab') return;
  const items = navigationSheet.querySelectorAll('a[href], button');
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || !navigationSheet.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !navigationSheet.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
});
let touchStartY = null;
const handle = document.querySelector('.navigation-sheet-handle');
handle.addEventListener('touchstart', (event) => { touchStartY = event.touches[0].clientY; }, { passive: true });
handle.addEventListener('touchend', (event) => {
  if (touchStartY !== null && event.changedTouches[0].clientY - touchStartY > 45) closeMenu();
  touchStartY = null;
}, { passive: true });
window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());
let lastScrollY = window.scrollY;
let chromeFrame = 0;
function updateChrome() {
  const nextScrollY = Math.max(0, window.scrollY);
  const scrollDelta = nextScrollY - lastScrollY;
  const isScrolled = header.classList.contains('is-scrolled') ? nextScrollY > 8 : nextScrollY > 24;
  header.classList.toggle('is-scrolled', isScrolled);
  if (menuOpen || nextScrollY < 92) chrome.classList.remove('is-hidden');
  else if (scrollDelta > 3) chrome.classList.add('is-hidden');
  else if (scrollDelta < 0) chrome.classList.remove('is-hidden');
  lastScrollY = nextScrollY;
  chromeFrame = 0;
}
window.addEventListener('scroll', () => {
  if (!chromeFrame) chromeFrame = requestAnimationFrame(updateChrome);
}, { passive: true });
updateChrome();

// Armoze's announcement carousel: 500 ms directional motion, 2.5 s rotation.
const promoCarousel = document.querySelector('.launch-promo-carousel');
const promoSlides = [...document.querySelectorAll('.launch-promo-slide')];
let activePromoIndex = 0;
let transitionTimer = null;
let rotationTimer = null;
function showPromo(step) {
  const currentIndex = activePromoIndex;
  const nextIndex = (currentIndex + step + promoSlides.length) % promoSlides.length;
  clearTimeout(transitionTimer);
  promoSlides.forEach((slide, index) => {
    slide.classList.toggle('is-previous', index === currentIndex);
    slide.classList.toggle('is-active', index === nextIndex);
    slide.setAttribute('aria-hidden', String(index !== nextIndex));
    slide.inert = index !== nextIndex;
  });
  promoCarousel.classList.toggle('direction-forward', step > 0);
  promoCarousel.classList.toggle('direction-backward', step < 0);
  activePromoIndex = nextIndex;
  transitionTimer = setTimeout(() => {
    promoSlides.forEach((slide) => slide.classList.remove('is-previous'));
    transitionTimer = null;
  }, 520);
}
function restartRotation() {
  clearInterval(rotationTimer);
  rotationTimer = setInterval(() => {
    if (!document.hidden && !promoCarousel.matches(':hover, :focus-within')) showPromo(1);
  }, 2500);
}
document.querySelector('.announcement-prev').addEventListener('click', () => { showPromo(-1); restartRotation(); });
document.querySelector('.announcement-next').addEventListener('click', () => { showPromo(1); restartRotation(); });
restartRotation();

// Same snap calculation and keyboard controls as Armoze's FooterBenefits.
const benefitTrack = document.querySelector('.footer-benefits-inner');
const benefitDots = [...document.querySelectorAll('[data-benefit]')];
function showBenefit(index) {
  benefitTrack.scrollTo({ left: index * benefitTrack.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
benefitDots.forEach((dot, index) => {
  dot.addEventListener('click', () => showBenefit(index));
  dot.addEventListener('keydown', (event) => {
    const nextIndex = event.key === 'ArrowRight' ? Math.min(index + 1, benefitDots.length - 1)
      : event.key === 'ArrowLeft' ? Math.max(index - 1, 0)
        : event.key === 'Home' ? 0 : event.key === 'End' ? benefitDots.length - 1 : null;
    if (nextIndex === null) return;
    event.preventDefault();
    showBenefit(nextIndex);
    benefitDots[nextIndex].focus({ preventScroll: true });
  });
});
let benefitFrame = 0;
benefitTrack.addEventListener('scroll', () => {
  if (benefitFrame) return;
  benefitFrame = requestAnimationFrame(() => {
    benefitFrame = 0;
    if (!benefitTrack.clientWidth) return;
    const active = Math.max(0, Math.min(benefitDots.length - 1, Math.round(benefitTrack.scrollLeft / benefitTrack.clientWidth)));
    benefitDots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === active)));
  });
}, { passive: true });

// Photo banner: ten-second rotation, manual navigation, and an explicit pause control.
const banner = document.querySelector('.hvac-banner');
if (banner) {
  const track = banner.querySelector('.hvac-banner-track');
  const slides = [...track.children];
  const leadingClone = slides[slides.length - 1].cloneNode(true);
  const trailingClone = slides[0].cloneNode(true);
  for (const clone of [leadingClone, trailingClone]) {
    clone.classList.remove('is-active'); clone.classList.add('is-clone');
    clone.setAttribute('aria-hidden', 'true'); clone.inert = true;
    clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  }
  track.prepend(leadingClone); track.append(trailingClone);
  const dots = [...banner.querySelectorAll('[data-banner]')];
  const pauseButton = banner.querySelector('.banner-pause');
  const reduceBannerMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let bannerIndex = 0;
  let bannerTimer = 0;
  let bannerPaused = reduceBannerMotion.matches;
  let bannerFocus = false;
  let bannerWrapping = false;
  function showBanner(index, animate = true) {
    if (bannerWrapping && animate) return;
    const wrapping = animate && (index < 0 || index >= slides.length);
    const physicalIndex = wrapping ? (index < 0 ? 0 : slides.length + 1) : ((index + slides.length) % slides.length) + 1;
    bannerIndex = (index + slides.length) % slides.length;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translateX(-${physicalIndex * (slides[0].getBoundingClientRect().width + gap)}px)`;
    if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = ''; }));
    if (wrapping) {
      bannerWrapping = true;
      setTimeout(() => { bannerWrapping = false; showBanner(bannerIndex, false); }, reduceBannerMotion.matches ? 0 : 2000);
    }
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === bannerIndex);
      slide.setAttribute('aria-hidden', String(i !== bannerIndex));
      slide.inert = i !== bannerIndex;
      dots[i].setAttribute('aria-pressed', String(i === bannerIndex));
    });
  }
  function scheduleBanner() {
    clearInterval(bannerTimer);
    if (!bannerPaused && !bannerFocus && !document.hidden) bannerTimer = setInterval(() => showBanner(bannerIndex + 1), 10000);
  }
  banner.querySelector('.banner-prev').addEventListener('click', () => { showBanner(bannerIndex - 1); scheduleBanner(); });
  banner.querySelector('.banner-next').addEventListener('click', () => { showBanner(bannerIndex + 1); scheduleBanner(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { showBanner(i); scheduleBanner(); }));
  pauseButton.addEventListener('click', () => {
    bannerPaused = !bannerPaused;
    pauseButton.setAttribute('aria-label', bannerPaused ? 'Play banner slideshow' : 'Pause banner slideshow');
    pauseButton.innerHTML = bannerPaused ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M9 5v14M15 5v14" /></svg>';
    scheduleBanner();
  });
  banner.addEventListener('focusin', () => { bannerFocus = true; scheduleBanner(); });
  banner.addEventListener('focusout', (event) => { if (!banner.contains(event.relatedTarget)) { bannerFocus = false; scheduleBanner(); } });
  banner.addEventListener('keydown', (event) => {
    if (!event.target.closest('[data-banner]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); showBanner(bannerIndex + (event.key === 'ArrowRight' ? 1 : -1)); dots[bannerIndex].focus({preventScroll:true});
    }
  });
  let touchStart = null;
  banner.addEventListener('touchstart', (event) => { touchStart = event.touches[0].clientX; }, {passive:true});
  banner.addEventListener('touchend', (event) => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 45) { showBanner(bannerIndex + (delta < 0 ? 1 : -1)); scheduleBanner(); }
    touchStart = null;
  }, {passive:true});
  new ResizeObserver(() => showBanner(bannerIndex, false)).observe(banner);
  document.addEventListener('visibilitychange', scheduleBanner);
  reduceBannerMotion.addEventListener('change', () => { bannerPaused = reduceBannerMotion.matches; pauseButton.setAttribute('aria-label', bannerPaused ? 'Play banner slideshow' : 'Pause banner slideshow'); scheduleBanner(); });
  showBanner(0, false); scheduleBanner();
}


// Keep previously shared mobile request links aimed directly at the form fields.
function alignLegacyRequestLink() {
  if (location.hash !== '#request' || !window.matchMedia('(max-width: 760px)').matches) return;
  const requestForm = document.getElementById('service-request');
  if (!requestForm) return;
  history.replaceState(null, '', '#service-request');
  requestForm.scrollIntoView({block: 'start', behavior: 'instant'});
  requestForm.focus({preventScroll: true});
}
window.addEventListener('hashchange', alignLegacyRequestLink);
window.addEventListener('load', alignLegacyRequestLink);
