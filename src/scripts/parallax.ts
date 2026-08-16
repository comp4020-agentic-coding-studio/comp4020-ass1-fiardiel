// Three scroll-linked effects for the hook section, all recomputed on
// scroll via one rAF-throttled loop — no animation library, no
// scroll-jacking:
//
// 1. Each slide's foreground text lags slightly behind the scroll,
//    easing toward centered as the slide crosses the viewport's middle.
// 2. A background sheet-music watermark stays centered in the viewport
//    (via CSS position: sticky) and pans sideways as you scroll — motion
//    on a different AXIS than the vertical scroll reads as a much
//    stronger "layered" cue than matching the scroll direction would;
//    the text drift alone was too subtle to register as parallax.
// 3. The header and the watermark each switch to a light-on-dark palette
//    based on whichever slide currently sits *behind their own position*
//    — the header at the very top of the viewport (y=0), the watermark
//    at the viewport's vertical center (where its sticky positioning
//    holds it). These are genuinely different trigger points: the
//    watermark should flip the moment the light/dark boundary passes
//    the middle of the screen, well before that same boundary reaches
//    the top edge where the header sits. Both reuse the same
//    getBoundingClientRect() read effect 1 already does per slide, so
//    this adds no extra layout cost.
export function initParallax(): void {
  const hookSection = document.querySelector<HTMLElement>(".hook");
  const watermark = document.querySelector<HTMLElement>(".hook-bg-inner");
  const hookBg = document.querySelector<HTMLElement>(".hook-bg");
  const header = document.querySelector<HTMLElement>("header");

  const pairs = Array.from(
    document.querySelectorAll<HTMLElement>(".hook-slide"),
  )
    .map((slide) => ({
      slide,
      content: slide.querySelector<HTMLElement>(".hook-content"),
    }))
    .filter(
      (pair): pair is { slide: HTMLElement; content: HTMLElement } =>
        pair.content !== null,
    );

  if (pairs.length === 0 && !hookSection) return;

  const DRIFT_FACTOR = 0.15;
  const MAX_PAN = 220; // pixels, across the whole hook section
  let ticking = false;

  function update(): void {
    const viewportCenter = window.innerHeight / 2;
    let headerIsDark = false;
    let watermarkIsDark = false;

    for (const { slide, content } of pairs) {
      const rect = slide.getBoundingClientRect();
      const slideCenter = rect.top + rect.height / 2;
      const offset = (viewportCenter - slideCenter) * DRIFT_FACTOR;
      content.style.transform = `translateY(${offset}px)`;

      // Whichever slide currently spans the very top of the viewport is
      // the one sitting behind the sticky header right now.
      if (rect.top <= 0 && rect.bottom > 0) {
        headerIsDark = slide.classList.contains("alt");
      }

      // Whichever slide currently spans the vertical center of the
      // viewport is the one the sticky, centered watermark sits over.
      if (rect.top <= viewportCenter && rect.bottom > viewportCenter) {
        watermarkIsDark = slide.classList.contains("alt");
      }
    }

    header?.classList.toggle("on-dark", headerIsDark);
    hookBg?.classList.toggle("on-dark", watermarkIsDark);

    if (hookSection && watermark) {
      // Progress reaches 1 exactly when .hook's bottom edge reaches the
      // top of the viewport — i.e. when the last slide has fully
      // scrolled out of view, not merely when it first fills the
      // screen. (rect.height alone, not rect.height - innerHeight.)
      const rect = hookSection.getBoundingClientRect();
      const progress =
        rect.height > 0
          ? Math.min(1, Math.max(0, -rect.top / rect.height))
          : 0;
      watermark.style.setProperty("--pan-x", `${-progress * MAX_PAN}px`);
    }

    ticking = false;
  }

  function onScroll(): void {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  update();
}

initParallax();
