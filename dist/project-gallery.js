const gallery = document.querySelector('#project-gallery');
const controls = document.querySelector('.project-gallery-controls');
const slides = Array.from(gallery.children);
const numbers = Array.from(controls.querySelectorAll('a'));
const [previous, next] = controls.querySelectorAll('button');
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
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  gallery.scrollTo({ left, behavior });
}

controls.addEventListener('click', (event) => {
  const target = event.target.closest('button, a');
  if (!target) return;
  const direction = Number(target.dataset.galleryDirection);
  if (direction) showProject((requested ?? active) + direction);
  else {
    event.preventDefault();
    showProject(numbers.indexOf(target));
  }
});
gallery.addEventListener('scroll', updateControls, { passive: true });
gallery.addEventListener('scrollend', () => { requested = null; });
new ResizeObserver(updateControls).observe(gallery);
updateControls();
