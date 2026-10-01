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
    }
  });
  updateReveal();
}
document.querySelector('#copyright-year').textContent = new Date().getFullYear();

// Mobile menu keeps the reference's centered logo and useful HVAC actions.
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');
function closeMenu(returnFocus = false) {
  navigation.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = !navigation.classList.contains('is-open');
  navigation.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', () => closeMenu());

const announcements = [
  ['A question? Let’s talk about your comfort.', '#request'],
  ['Family owned. Proudly serving New Jersey.', '#about'],
  ['Comfort done right. Call 732-500-5428.', 'tel:+17325005428'],
];
let announcementIndex = 0;
function showAnnouncement(direction) {
  announcementIndex = (announcementIndex + direction + announcements.length) % announcements.length;
  const link = document.querySelector('#announcement-text');
  link.textContent = announcements[announcementIndex][0];
  link.href = announcements[announcementIndex][1];
}
document.querySelector('.announcement-prev').addEventListener('click', () => showAnnouncement(-1));
document.querySelector('.announcement-next').addEventListener('click', () => showAnnouncement(1));

// Snap carousel supports both swiping and the reference's dot controls.
const benefitTrack = document.querySelector('.footer-benefits-inner');
const benefitDots = [...document.querySelectorAll('[data-benefit]')];
benefitDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    benefitTrack.scrollTo({ left: benefitTrack.clientWidth * index, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
});
let benefitFrame = 0;
benefitTrack.addEventListener('scroll', () => {
  if (benefitFrame) return;
  benefitFrame = requestAnimationFrame(() => {
    benefitFrame = 0;
    const active = Math.round(benefitTrack.scrollLeft / benefitTrack.clientWidth);
    benefitDots.forEach((dot, index) => dot.setAttribute('aria-pressed', String(index === active)));
  });
}, { passive: true });
