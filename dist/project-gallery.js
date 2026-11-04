const gallery = document.querySelector('#project-gallery');
const controls = document.querySelector('.project-gallery-controls');
const [previous, next] = controls.querySelectorAll('button');

function updateControls() {
  previous.disabled = gallery.scrollLeft <= 1;
  next.disabled = gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 1;
}

controls.hidden = false;
controls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-gallery-direction]');
  if (!button) return;

  const card = gallery.firstElementChild;
  const gap = parseFloat(getComputedStyle(gallery).columnGap);
  const distance = card.getBoundingClientRect().width + gap;
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';

  gallery.scrollBy({ left: distance * Number(button.dataset.galleryDirection), behavior });
});
gallery.addEventListener('scroll', updateControls, { passive: true });
new ResizeObserver(updateControls).observe(gallery);
updateControls();
