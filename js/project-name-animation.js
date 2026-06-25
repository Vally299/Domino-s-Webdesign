/* ============================================
   PROJECT-NAME-ANIMATION
   Animation 3D du nom de projet courant, dans le
   même esprit que la stack d'images du carrousel :
   - le nom courant est net, centré, au premier plan
   - les noms adjacents sont flous, pivotés, déplacés
   - transitions fluides avec perspective
   - bonus : reveal lettre par lettre à chaque changement
   ============================================ */

(function () {
  "use strict";

  function init() {
    const stack = document.querySelector("[data-carousel-name-stack]");
    if (!stack) return;

    // ====== Helpers ======
    function splitLetters(el) {
      const text = el.textContent;
      el.textContent = "";
      const letters = Array.from(text);
      letters.forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "pna-letter";
        span.textContent = ch === " " ? "\u00A0" : ch;
        span.style.setProperty("--i", i);
        el.appendChild(span);
      });
    }

    function revealLetters(el) {
      const letters = el.querySelectorAll(".pna-letter");
      letters.forEach((letter) => {
        // reset
        letter.style.transition = "none";
        letter.style.transform = "translateY(110%) rotateX(-90deg)";
        letter.style.opacity = "0";
        // force reflow
        // eslint-disable-next-line no-unused-expressions
        letter.offsetHeight;
        letter.style.transition =
          "transform 700ms var(--ease), opacity 500ms var(--ease)";
        letter.style.transitionDelay =
          `calc(var(--i) * 28ms + 100ms)`;
        letter.style.transform = "translateY(0) rotateX(0)";
        letter.style.opacity = "1";
      });
    }

    function setState(prevIndex, currentIndex) {
      const items = stack.querySelectorAll(".carousel-info__name");
      items.forEach((el, i) => {
        el.classList.remove("is-current", "is-prev", "is-next");
        if (i === currentIndex) {
          el.classList.add("is-current");
          // refait le reveal lettre par lettre
          if (!el.querySelector(".pna-letter")) splitLetters(el);
          revealLetters(el);
        } else if (i < currentIndex) {
          el.classList.add("is-prev");
        } else {
          el.classList.add("is-next");
        }
      });
    }

    // ====== Initial split de tous les noms ======
    stack.querySelectorAll(".carousel-info__name").forEach((el) => {
      splitLetters(el);
    });

    // ====== Hook sur le carrousel ======
    // On écoute l'événement custom émis par carousel.js
    document.addEventListener("domino:carousel:change", (e) => {
      if (!e.detail) return;
      setState(e.detail.prev, e.detail.current);
    });

    // ====== État initial : on s'aligne sur le carrousel ======
    // Lit l'index courant via window.__dominoCarousel ou via le DOM
    // Si pas encore initialisé, on attend l'événement.
    const car = window.__dominoCarousel;
    if (car && typeof car.current === "number") {
      setState(car.current, car.current);
    } else {
      // Fallback : le premier nom est courant
      setState(0, 0);
    }

    // ====== API publique ======
    window.__dominoProjectNameAnim = {
      setState,
      revealLetters,
      splitLetters,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
