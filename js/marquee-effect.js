/**
 * marquee-effect.js
 * ------------------------------------------------------------------
 * Adaptation vanilla JS du composant React "MarqueeAnimation"
 * (shadcn/ui via Bundui) qui s'appuie sur framer-motion + @motionone/utils.
 *
 * Logique reproduite à l'identique :
 *   - useScroll      -> lecture de window.scrollY à chaque frame
 *   - useVelocity    -> vitesse instantanée (px/s)
 *   - useSpring(damping:50, stiffness:400)
 *                     -> lissage exponentiel : factor = 1 - exp(-k * dt)
 *   - useTransform   -> mapping [-1000, 1000] px/s -> [-5, 5] (facteur)
 *   - baseX          -> accumulateur en pixels
 *   - wrap()         -> modulo pour bouclage seamless sur 2 copies
 *   - useAnimationFrame -> rAF avec delta capping à 64ms
 *
 * Usage HTML :
 *   <div class="marquee__track" data-marquee-scroll> ... </div>
 *
 * Variables CSS (optionnelles) :
 *   --marquee-speed   : vitesse de base en px/s (défaut 45)
 *
 * Le projet n'utilise pas React/TS/Tailwind, donc tout est en JS pur.
 * ------------------------------------------------------------------
 */
(() => {
  "use strict";

  const TRACK_SELECTOR = "[data-marquee-scroll]";
  const tracks = document.querySelectorAll(TRACK_SELECTOR);
  if (!tracks.length) return;

  // Respect du prefers-reduced-motion
  const motionReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Constantes du spring (identiques au composant React)
  const STIFFNESS = 400;
  const DAMPING = 50;
  // Mapping lissé -> facteur multiplicateur (±5 max pour ±1000 px/s)
  const VELOCITY_TO_FACTOR = 1 / 200;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const init = () => {
    tracks.forEach((track) => {
      // Vitesse de base lue depuis --marquee-speed (CSS), avec fallback data-attr / défaut
      const cssSpeed = parseFloat(
        getComputedStyle(track).getPropertyValue("--marquee-speed").trim()
      );
      const dataSpeed = parseFloat(track.dataset.marqueeBaseVelocity);
      const baseVelocity =
        !Number.isNaN(cssSpeed) ? cssSpeed : !Number.isNaN(dataSpeed) ? dataSpeed : 45;

      const direction = track.dataset.marqueeDirection || "left";
      const directionFactor = direction === "left" ? 1 : -1;

      // Le contenu est dupliqué : on boucle sur la moitié de la track
      const halfWidth = () => Math.max(1, track.scrollWidth / 2);

      const state = {
        baseX: 0,
        smoothVelocity: 0,
        velocityFactor: 0,
        lastScrollY: window.scrollY,
        lastTime: performance.now(),
        paused: false,
        rafId: null,
      };

      // Pause au survol du wrapper (comme le CSS .marquee-wrapper:hover)
      const wrapper = track.closest(".marquee-wrapper");
      if (wrapper) {
        wrapper.addEventListener("mouseenter", () => {
          state.paused = true;
        });
        wrapper.addEventListener("mouseleave", () => {
          state.paused = false;
        });
      }

      const animate = (now) => {
        // Cap à 64ms pour éviter les sauts lors d'un onglet en arrière-plan
        const delta = Math.min(now - state.lastTime, 64);
        state.lastTime = now;

        // 1) Vitesse de scroll instantanée (px/s)
        const scrollY = window.scrollY;
        const scrollDelta = scrollY - state.lastScrollY;
        state.lastScrollY = scrollY;
        const scrollVelocity = delta > 0 ? (scrollDelta / delta) * 1000 : 0;

        // 2) Lissage spring : smooth += (target - smooth) * (1 - exp(-k * dt))
        const lerpFactor = 1 - Math.exp(-(STIFFNESS / DAMPING) * (delta / 1000));
        state.smoothVelocity +=
          (scrollVelocity - state.smoothVelocity) * Math.min(1, lerpFactor);

        // 3) Mapping -> facteur multiplicateur [-5, 5]
        state.velocityFactor = clamp(
          state.smoothVelocity * VELOCITY_TO_FACTOR,
          -5,
          5
        );

        // 4) Mouvement de base : baseVelocity en px/s * delta/1000
        let moveBy = directionFactor * baseVelocity * (delta / 1000);
        // 5) Multiplicateur de scroll (analogue à moveBy += dir * moveBy * velFactor)
        moveBy += directionFactor * moveBy * state.velocityFactor;

        if (!state.paused && !motionReduced) {
          state.baseX += moveBy;

          // 6) Wrap : baseX reste dans [0, halfWidth] -> boucle invisible
          const w = halfWidth();
          if (w > 1) {
            state.baseX = ((state.baseX % w) + w) % w;
          }
        }

        track.style.transform = `translate3d(${-state.baseX}px, 0, 0)`;

        state.rafId = requestAnimationFrame(animate);
      };

      state.rafId = requestAnimationFrame(animate);

      // Expose pour debug / inspection
      track._marqueeState = state;
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
