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
