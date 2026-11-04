document.querySelectorAll('.carousel-track').forEach((gallery) => {
  const controls = gallery.nextElementSibling;
  const itemName = gallery.id === 'certification-gallery' ? 'certification' : 'project';
  const slides = Array.from(gallery.children);
  const numbers = Array.from(controls.querySelectorAll('a'));
  const previous = controls.querySelector('[data-gallery-direction="-1"]');
  const next = controls.querySelector('[data-gallery-direction="1"]');
  const autoplay = controls.querySelector('.gallery-autoplay');
  const compact = matchMedia('(max-width: 650px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let inView = false;
  let timer;
  let active = 0;
  let requested = null;

  function pageSize() {
    return compact.matches ? 1 : 2;
  }

  function updateControls() {
    const left = gallery.getBoundingClientRect().left;
    active = slides.reduce((closest, slide, index) => {
      if (index % pageSize() !== 0) return closest;
      const distance = Math.abs(slide.getBoundingClientRect().left - left);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Infinity }).index;

    if (active === requested) requested = null;
    numbers.forEach((link, index) => {
      link.hidden = index % pageSize() !== 0;
      link.textContent = String(Math.floor(index / pageSize()) + 1).padStart(2, '0');
      link.setAttribute('aria-label', compact.matches ? `Show ${itemName} ${index + 1}` :
        `Show ${itemName}s ${index + 1} and ${index + 2}`);
      if (index === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    previous.disabled = active === 0;
    next.disabled = active + pageSize() >= slides.length;
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
    if (direction) showProject((requested ?? active) + direction * pageSize());
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
    if (paused || !inView || document.hidden ||
        gallery.contains(document.activeElement)) return;

    timer = setTimeout(() => {
      showProject((active + pageSize()) % slides.length);
      scheduleAutoplay();
    }, 2500);
  }

  function updateAutoplayButton() {
    autoplay.textContent = paused ? '▶' : 'Ⅱ';
    autoplay.setAttribute('aria-label', paused ? 'Play autoplay' : 'Pause autoplay');
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
  gallery.addEventListener('focusin', scheduleAutoplay);
  gallery.addEventListener('focusout', () => queueMicrotask(scheduleAutoplay));
  gallery.addEventListener('scroll', scheduleAutoplay, { passive: true });
  document.addEventListener('visibilitychange', scheduleAutoplay);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    scheduleAutoplay();
  }).observe(gallery);
  updateAutoplayButton();

  compact.addEventListener('change', () => {
    showProject(Math.floor(active / pageSize()) * pageSize());
    updateControls();
    scheduleAutoplay();
  });
});
