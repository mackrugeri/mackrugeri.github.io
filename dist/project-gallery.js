const gallery = document.querySelector('#project-gallery');
const controls = document.querySelector('.project-gallery-controls');
const slides = Array.from(gallery.children);
const numbers = Array.from(controls.querySelectorAll('a'));
const previous = controls.querySelector('[data-gallery-direction="-1"]');
const next = controls.querySelector('[data-gallery-direction="1"]');
const autoplay = document.querySelector('#project-autoplay');
const work = gallery.closest('#work');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let inView = false;
let timer;
let active = 0;
let requested = null;

function updateControls() {
  const left = gallery.getBoundingClientRect().left;
  active = slides.reduce((closest, slide, index) => {
    const distance = Math.abs(slide.getBoundingClientRect().left - left);
    return distance < closest.distance ? { index, distance } : closest;
  }, { index: 0, distance: Infinity }).index;

  if (active === requested) requested = null;
  numbers.forEach((link, index) => {
    if (index === active) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  previous.disabled = active === 0;
  next.disabled = active === slides.length - 1;
}

function showProject(index) {
  if (index < 0 || index >= slides.length) return;
  requested = index;
  const left = gallery.scrollLeft + slides[index].getBoundingClientRect().left -
    gallery.getBoundingClientRect().left;
  const behavior = reducedMotion.matches ? 'instant' : 'smooth';
  gallery.scrollTo({ left, behavior });
}

controls.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target || target === autoplay) return;
  const direction = Number(target.dataset.galleryDirection);
  if (direction) showProject((requested ?? active) + direction);
  else {
    event.preventDefault();
    showProject(numbers.indexOf(target));
  }
  scheduleAutoplay();
});
gallery.addEventListener('scroll', updateControls, { passive: true });
gallery.addEventListener('scrollend', () => { requested = null; });
new ResizeObserver(updateControls).observe(gallery);
updateControls();

function scheduleAutoplay() {
  clearTimeout(timer);
  if (paused || !inView || document.hidden || gallery.matches(':hover') ||
      gallery.contains(document.activeElement)) return;

  timer = setTimeout(() => {
    showProject((active + 1) % slides.length);
    scheduleAutoplay();
  }, 5000);
}

function updateAutoplayButton() {
  autoplay.textContent = paused ? 'Play autoplay' : 'Pause autoplay';
  scheduleAutoplay();
}

autoplay.hidden = false;
autoplay.addEventListener('click', () => {
  paused = !paused;
  updateAutoplayButton();
});
reducedMotion.addEventListener('change', (event) => {
  if (event.matches) paused = true;
  updateAutoplayButton();
});
gallery.addEventListener('pointerenter', scheduleAutoplay);
gallery.addEventListener('pointerleave', scheduleAutoplay);
gallery.addEventListener('focusin', scheduleAutoplay);
gallery.addEventListener('focusout', () => queueMicrotask(scheduleAutoplay));
gallery.addEventListener('scroll', scheduleAutoplay, { passive: true });
document.addEventListener('visibilitychange', scheduleAutoplay);
new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  scheduleAutoplay();
}).observe(work.querySelector('.project-gallery-controls'));
updateAutoplayButton();
