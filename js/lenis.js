/* ============================================
   LENIS — Smooth scroll
   ============================================ */

(function () {
  "use strict";

  function init() {
    if (typeof Lenis === "undefined") {
      // Lenis not loaded yet, retry
      return setTimeout(init, 50);
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // RAF loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Bridge with GSAP ScrollTrigger if available
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      
      // Sync Lenis with GSAP ticker properly
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      
      // Prevent GSAP from controlling the scroll
      gsap.ticker.lagSmoothing(0);
      
      // Refresh ScrollTrigger on resize
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 250);
      });
    }

    // Expose for other modules
    window.__lenis = lenis;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
