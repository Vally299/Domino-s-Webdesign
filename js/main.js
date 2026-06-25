/* ============================================
   MAIN — Entry point, icons init, misc
   ============================================ */

(function () {
  "use strict";

  function init() {
    // Lucide icons
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      try {
        window.lucide.createIcons({
          attrs: {
            "stroke-width": 1.5,
            width: "1em",
            height: "1em",
          },
        });
      } catch (e) {
        console.warn("Lucide init failed", e);
      }
    } else {
      // Retry once lucide loads
      window.addEventListener("load", () => {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          try { window.lucide.createIcons(); } catch (e) {}
        }
      });
    }

    // Smooth scroll fallback for browsers without Lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector(href);
        if (!target) return;
        // Only intercept if Lenis not present
        if (!window.__lenis) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Console signature
    const style = "background:#0E0E0E;color:#7CFF00;padding:6px 12px;border-radius:6px;font-family:monospace;font-weight:bold;";
    console.log("%cDomino Web%c· agence premium", style, "color:#00FF7F;font-family:monospace");
    console.log("%cUn projet ? → dominolaverne24@gmail.com", "color:#00FF7F;font-family:monospace");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
