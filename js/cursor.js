/* ============================================
   CURSOR — Green arrow cursor with magnet effect
   ============================================ */

(function () {
  "use strict";

  function init() {
    const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!isFinePointer) return;

    const cursor = document.getElementById("cursor");
    if (!cursor) return;

    document.body.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;

    const CURSOR_SPEED = 0.18;

    function onMove(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    function loop() {
      cursorX += (mouseX - cursorX) * CURSOR_SPEED;
      cursorY += (mouseY - cursorY) * CURSOR_SPEED;

      if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

      requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    requestAnimationFrame(loop);

    document.addEventListener("mouseleave", () => {
      cursor.style.opacity = "0";
    });
    document.addEventListener("mouseenter", () => {
      cursor.style.opacity = "1";
    });

    const hoverTargets = document.querySelectorAll(
      "a, button, [data-magnet], .faq__item summary, .chip, label"
    );
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });

    const magnets = document.querySelectorAll("[data-magnet]");
    const MAGNET_STRENGTH = 0.35;

    magnets.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * MAGNET_STRENGTH}px, ${y * MAGNET_STRENGTH}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
