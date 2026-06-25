/* ============================================
   CAROUSEL — Stack vertical 3D d'images
   Adapté du composant React/Framer-Motion en JS vanilla
   Supporte : wheel, drag vertical, boutons, dots, autoplay
   ============================================ */

(function () {
  "use strict";

  const NAV_COOLDOWN = 400; // ms entre deux navigations (anti spam)

  function init() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;

    const track = root.querySelector("[data-carousel-track]");
    if (!track) return;

    const slides = Array.from(track.querySelectorAll("[data-carousel-slide]"));
    if (slides.length < 2) return;

    const dotsContainer = root.querySelector("[data-carousel-dots]");
    const btnPrev = root.querySelector("[data-carousel-prev]");
    const btnNext = root.querySelector("[data-carousel-next]");
    const counterCurrent = root.querySelector("[data-carousel-current]");
    const counterTotal = root.querySelector("[data-carousel-total]");
    const nameStack = root.querySelector("[data-carousel-name-stack]");
    const descEl = root.querySelector("[data-carousel-desc]");
    const tagsContainer = root.querySelector("[data-carousel-tags]");
    const hint = root.querySelector("[data-carousel-hint]");

    const state = {
      current: 0,
      total: slides.length,
      lastNav: 0,
      names: [],
      descs: [],
      tags: [],
      autoplay: null,
      isDragging: false,
    };

    // Collecte des noms / descriptions / tags depuis data-*
    slides.forEach((slide, i) => {
      state.names.push(slide.dataset.name || `Projet ${i + 1}`);
      state.descs.push(slide.dataset.desc || "");
      const raw = slide.dataset.tags || "";
      state.tags.push(
        raw.split("|").map((t) => t.trim()).filter(Boolean)
      );
    });

    // ===== Construction des dots =====
    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      for (let i = 0; i < state.total; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Aller au projet ${i + 1}`);
        dot.addEventListener("click", () => goTo(i, true));
        dotsContainer.appendChild(dot);
      }
    }

    // ===== Construction du stack de noms =====
    if (nameStack) {
      nameStack.innerHTML = "";
      state.names.forEach((n, i) => {
        const el = document.createElement("span");
        el.className = "carousel-info__name";
        el.textContent = n;
        nameStack.appendChild(el);
      });
    }

    // ===== Helpers =====
    function getCardStyle(index) {
      const total = state.total;
      let diff = index - state.current;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      if (diff === 0) {
        return { y: 0, scale: 1, opacity: 1, zIndex: 5, rotateX: 0 };
      } else if (diff === -1) {
        return { y: -115, scale: 0.88, opacity: 0.75, zIndex: 4, rotateX: 8 };
      } else if (diff === -2) {
        return { y: -215, scale: 0.78, opacity: 0.4, zIndex: 3, rotateX: 14 };
      } else if (diff === 1) {
        return { y: 115, scale: 0.88, opacity: 0.75, zIndex: 4, rotateX: -8 };
      } else if (diff === 2) {
        return { y: 215, scale: 0.78, opacity: 0.4, zIndex: 3, rotateX: -14 };
      } else {
        return {
          y: diff > 0 ? 320 : -320,
          scale: 0.65,
          opacity: 0,
          zIndex: 0,
          rotateX: diff > 0 ? -18 : 18,
        };
      }
    }

    function isVisible(index) {
      const total = state.total;
      let diff = index - state.current;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      return Math.abs(diff) <= 2;
    }

    function applyCardTransforms() {
      slides.forEach((slide, i) => {
        const style = getCardStyle(i);
        const visible = isVisible(i);
        const isCurrent = i === state.current;

        slide.style.transform =
          `translate3d(0, ${style.y}px, 0) ` +
          `scale(${style.scale}) ` +
          `rotateX(${style.rotateX}deg)`;
        slide.style.opacity = visible ? style.opacity : 0;
        slide.style.zIndex = style.zIndex;
        slide.style.pointerEvents = isCurrent ? "auto" : "none";
        slide.classList.toggle("is-current", isCurrent);
        slide.style.visibility = visible ? "visible" : "hidden";
      });
    }

    function applyNameTransforms() {
      // Délègue à project-name-animation.js via l'événement domino:carousel:change
      // On ne touche plus aux classes ici pour éviter les conflits.
    }

    function applyContent() {
      if (descEl) {
        descEl.style.opacity = "0";
        setTimeout(() => {
          descEl.textContent = state.descs[state.current];
          descEl.style.opacity = "1";
        }, 200);
      }

      if (tagsContainer) {
        tagsContainer.innerHTML = "";
        state.tags[state.current].forEach((tag) => {
          const chip = document.createElement("span");
          chip.className = "carousel-info__chip";
          chip.textContent = tag;
          tagsContainer.appendChild(chip);
        });
      }

      if (counterCurrent) {
        counterCurrent.textContent = String(state.current + 1).padStart(2, "0");
      }
      if (counterTotal) {
        counterTotal.textContent = String(state.total).padStart(2, "0");
      }

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((d, i) =>
          d.classList.toggle("is-active", i === state.current)
        );
      }
    }

    // ===== Navigation =====
    function canNavigate() {
      const now = Date.now();
      if (now - state.lastNav < NAV_COOLDOWN) return false;
      state.lastNav = now;
      return true;
    }

    function navigate(dir, fromUser = false) {
      if (fromUser && !canNavigate()) return;
      if (state.isDragging) return;

      const newIndex =
        dir > 0
          ? (state.current + 1) % state.total
          : (state.current - 1 + state.total) % state.total;

      const prev = state.current;
      state.current = newIndex;
      applyCardTransforms();
      applyNameTransforms();
      applyContent();
      emitChange(prev, state.current);
      resetAutoplay();
    }

    function goTo(i, fromUser = false) {
      if (i === state.current) return;
      if (fromUser && !canNavigate()) return;
      if (state.isDragging) return;
      const prev = state.current;
      state.current = i;
      applyCardTransforms();
      applyNameTransforms();
      applyContent();
      emitChange(prev, state.current);
      resetAutoplay();
    }

    function emitChange(prev, current) {
      document.dispatchEvent(
        new CustomEvent("domino:carousel:change", {
          detail: { prev, current, total: state.total },
        })
      );
    }

    // ===== Wheel =====
    let wheelAccum = 0;
    let wheelTimer = null;
    function onWheel(e) {
      // Ne capturer la wheel que si la souris est sur la zone du stack
      if (!e.target.closest(".carousel-stack")) return;
      e.preventDefault();
      wheelAccum += e.deltaY;
      if (Math.abs(wheelAccum) > 30) {
        navigate(wheelAccum > 0 ? 1 : -1, true);
        wheelAccum = 0;
      }
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        wheelAccum = 0;
      }, 150);
    }

    // ===== Drag vertical =====
    function attachDrag(slide) {
      const start = { x: 0, y: 0, time: 0 };
      let current = { x: 0, y: 0 };
      let active = false;

      const onDown = (e) => {
        const isCurrent = slide.classList.contains("is-current");
        if (!isCurrent) return;
        active = true;
        state.isDragging = false;
        slide.style.transition = "none";
        const point = e.touches ? e.touches[0] : e;
        start.x = point.clientX;
        start.y = point.clientY;
        start.time = Date.now();
        current = { x: 0, y: 0 };
      };

      const onMove = (e) => {
        if (!active) return;
        const point = e.touches ? e.touches[0] : e;
        current.y = point.clientY - start.y;
        if (Math.abs(current.y) > 5) state.isDragging = true;
        // Drag suit le doigt avec résistance
        const resistance = 0.4;
        slide.style.transform =
          `translate3d(0, ${current.y * resistance}px, 0) ` +
          `scale(1) rotateX(${current.y * 0.05}deg)`;
      };

      const onUp = () => {
        if (!active) return;
        active = false;
        slide.style.transition = "";
        const threshold = 50;
        if (current.y < -threshold) navigate(1, true);
        else if (current.y > threshold) navigate(-1, true);
        else applyCardTransforms();
        setTimeout(() => {
          state.isDragging = false;
        }, 50);
      };

      slide.addEventListener("mousedown", onDown);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      slide.addEventListener("touchstart", onDown, { passive: true });
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onUp);
    }

    slides.forEach(attachDrag);

    // ===== Boutons =====
    if (btnPrev) btnPrev.addEventListener("click", () => navigate(-1, true));
    if (btnNext) btnNext.addEventListener("click", () => navigate(1, true));

    // ===== Wheel global (avec throttling) =====
    let wheelAttached = false;
    function onWheelThrottled(e) {
      if (wheelAttached) return;
      wheelAttached = true;
      onWheel(e);
      setTimeout(() => {
        wheelAttached = false;
      }, 50);
    }
    root.addEventListener("wheel", onWheelThrottled, { passive: false });

    // ===== Clavier =====
    function onKey(e) {
      if (!root.matches(":hover") && !root.contains(document.activeElement)) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1, true);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1, true);
      }
    }
    document.addEventListener("keydown", onKey);

    // ===== Autoplay (pause au hover) =====
    function resetAutoplay() {
      if (state.autoplay) clearInterval(state.autoplay);
      // Pas d'autoplay par défaut, mais on garde la structure
    }

    // ===== Initialisation =====
    if (counterTotal) counterTotal.textContent = String(state.total).padStart(2, "0");
    if (counterCurrent) counterCurrent.textContent = "01";
    applyCardTransforms();
    applyNameTransforms();
    applyContent();

    // Émet l'événement initial pour que project-name-animation.js applique l'état
    // On attend un tick pour que project-name-animation.js soit initialisé
    requestAnimationFrame(() => {
      emitChange(0, 0);
    });

    // Masquer l'indice après 5s
    if (hint) {
      setTimeout(() => {
        hint.style.transition = "opacity 600ms";
        hint.style.opacity = "0";
        setTimeout(() => (hint.style.display = "none"), 700);
      }, 6000);
    }

    // Cleanup (utile en SPA)
    window.__dominoCarousel = {
      goTo,
      navigate,
      destroy: () => {
        if (state.autoplay) clearInterval(state.autoplay);
        document.removeEventListener("keydown", onKey);
        root.removeEventListener("wheel", onWheelThrottled);
      },
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
