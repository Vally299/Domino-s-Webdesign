/* ============================================
   TESTIMONIALS — Robust translateX slider
   ============================================ */

(function () {
  "use strict";

  function init() {
    const track = document.getElementById("testimonialsTrack");
    const prevBtn = document.getElementById("tPrev");
    const nextBtn = document.getElementById("tNext");
    const dotsWrap = document.getElementById("tDots");
    const viewport = track?.parentElement;

    if (!track || !prevBtn || !nextBtn || !viewport) return;

    const items = Array.from(track.querySelectorAll(".testimonial"));
    if (!items.length) return;

    let currentPage = 0;
    let visibleCount = 2;
    let totalPages = 1;

    function computeVisible() {
      const w = window.innerWidth;
      if (w <= 600) visibleCount = 1;
      else if (w <= 980) visibleCount = 1;
      else visibleCount = 2;
    }

    function computePages() {
      totalPages = Math.max(1, items.length - visibleCount + 1);
      if (currentPage > totalPages - 1) currentPage = totalPages - 1;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";
      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement("button");
        dot.className = "t-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Témoignage ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll(".t-dot").forEach((d, i) => {
        d.classList.toggle("is-active", i === currentPage);
      });
    }

    function goTo(index) {
      currentPage = Math.max(0, Math.min(index, totalPages - 1));
      const firstItem = items[0];
      const secondItem = items[currentPage] || firstItem;
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.gap) || 16;
      const itemWidth = secondItem.getBoundingClientRect().width + gap;
      const offset = currentPage * itemWidth;
      track.style.transform = `translateX(-${offset}px)`;
      updateDots();
      updateButtons();
    }

    function updateButtons() {
      prevBtn.disabled = currentPage <= 0;
      nextBtn.disabled = currentPage >= totalPages - 1;
    }

    function next() {
      if (currentPage < totalPages - 1) goTo(currentPage + 1);
    }
    function prev() {
      if (currentPage > 0) goTo(currentPage - 1);
    }

    prevBtn.addEventListener("click", prev);
    nextBtn.addEventListener("click", next);

    // Touch swipe
    let startX = 0;
    let isDragging = false;
    let currentDelta = 0;
    let baseTransform = 0;

    viewport.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      track.style.transition = "none";
    }, { passive: true });

    viewport.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentDelta = e.touches[0].clientX - startX;
      const firstItem = items[0];
      const secondItem = items[currentPage] || firstItem;
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.gap) || 16;
      const itemWidth = secondItem.getBoundingClientRect().width + gap;
      baseTransform = currentPage * itemWidth;
      track.style.transform = `translateX(-${baseTransform - currentDelta}px)`;
    }, { passive: true });

    viewport.addEventListener("touchend", () => {
      isDragging = false;
      track.style.transition = "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)";
      if (Math.abs(currentDelta) > 60) {
        if (currentDelta < 0) next(); else prev();
      } else {
        goTo(currentPage);
      }
      currentDelta = 0;
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      const rect = viewport.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isVisible) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });

    // Resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        computeVisible();
        computePages();
        buildDots();
        goTo(currentPage);
      }, 150);
    });

    // Init
    computeVisible();
    computePages();
    buildDots();
    goTo(0);

    // Auto-advance every 6s, pause on hover
    let auto = setInterval(next, 6000);
    viewport.addEventListener("mouseenter", () => clearInterval(auto));
    viewport.addEventListener("mouseleave", () => { auto = setInterval(next, 6000); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
