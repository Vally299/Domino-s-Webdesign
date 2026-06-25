/* ============================================
   ANIMATIONS — GSAP reveal, split text, parallax
   ============================================ */

(function () {
  "use strict";

  const state = {
    gsapReady: false,
    splitReady: false,
    scrollReady: false,
  };

  function when(predicate, cb) {
    if (predicate()) return cb();
    const interval = setInterval(() => {
      if (predicate()) {
        clearInterval(interval);
        cb();
      }
    }, 50);
  }

  function init() {
    when(() => window.gsap && window.ScrollTrigger, () => {
      state.gsapReady = true;
      state.scrollReady = true;
      gsap.registerPlugin(ScrollTrigger);
      setup();
    });
  }

  function splitText(el) {
    // Simple word/line splitter — no external lib required
    const text = el.textContent.trim();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    el.innerHTML = "";

    lines.forEach((line) => {
      const lineEl = document.createElement("span");
      lineEl.className = "split-line";
      const inner = document.createElement("span");

      const words = line.split(/\s+/);
      words.forEach((word, i) => {
        const wordEl = document.createElement("span");
        wordEl.className = "split-word";
        const wordInner = document.createElement("span");
        wordInner.textContent = word + (i < words.length - 1 ? "\u00A0" : "");
        wordEl.appendChild(wordInner);
        lineEl.appendChild(wordEl);
      });

      inner.appendChild(lineEl);
      el.appendChild(inner);
    });
  }

  function setup() {
    // Split text elements
    const splitEls = document.querySelectorAll("[data-split]");
    splitEls.forEach(splitText);

    // --- Liste des attributs à animer au scroll ---
    const animatedAttrs = [
      "data-reveal",
      "data-split",
      "data-blur",
      "data-highlight",
      "data-stagger",
      "data-fade",
      "data-underline",
      "data-pop",
    ];

    animatedAttrs.forEach((attr) => {
      const els = document.querySelectorAll("[" + attr + "]");
      els.forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          onEnter: () => el.classList.add("is-visible"),
        });
      });
    });

    // Process timeline progress line
    const processSection = document.querySelector(".process");
    if (processSection) {
      const line = processSection.querySelector(".process__line");
      if (line) {
        ScrollTrigger.create({
          trigger: processSection,
          start: "top 70%",
          end: "bottom 70%",
          scrub: 0.5,
          onUpdate: (self) => {
            line.style.setProperty("--progress", (self.progress * 100) + "%");
          },
        });
      }
    }

    // 3D tilt on service cards
    const tiltEls = document.querySelectorAll("[data-tilt]");
    tiltEls.forEach((el) => {
      const intensity = 8;
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateY(-2px)`;
        el.style.setProperty("--mx", (x * 100 + 50) + "%");
        el.style.setProperty("--my", (y * 100 + 50) + "%");
      };
      const onLeave = () => {
        el.style.transform = "";
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    });

    // Subtle parallax on shapes inside projets
    const projetVisuals = document.querySelectorAll(".projet__visual");
    projetVisuals.forEach((wrap) => {
      const shapes = wrap.querySelectorAll(".projet__shape");
      wrap.addEventListener("mousemove", (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        shapes.forEach((s, i) => {
          const depth = (i + 1) * 10;
          s.style.transform = `translate(${x * depth}px, ${y * depth}px) scale(1.1)`;
        });
      });
      wrap.addEventListener("mouseleave", () => {
        shapes.forEach((s) => { s.style.transform = ""; });
      });
    });

    // Hero entrance (after loader)
    window.addEventListener("domino:loaded", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero__tag", { y: 20, opacity: 0, duration: 0.7 }, 0)
        .from(".hero__title .split-line > span", { y: "110%", duration: 1, stagger: 0.12 }, 0.1)
        .from(".hero__sub", { y: 20, opacity: 0, duration: 0.7 }, 0.6)
        .from(".hero__pills li", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.65)
        .from(".hero__cta", { y: 20, opacity: 0, duration: 0.7 }, 0.7)
        .from(".hero__meta-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, 0.8)
        .from(".hero__scroll", { opacity: 0, duration: 0.5 }, 1);
    });

    // Service cards — stagger reveal
    gsap.utils.toArray(".service-card").forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: "top 85%" },
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: i * 0.1,
        ease: "power3.out",
      });
    });

    // Service card list items — stagger
    gsap.utils.toArray(".service-card").forEach((card) => {
      const items = card.querySelectorAll(".service-card__list li");
      if (!items.length) return;
      gsap.from(items, {
        scrollTrigger: { trigger: card, start: "top 80%" },
        x: -16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        delay: 0.3,
        ease: "power2.out",
      });
    });

    // Process steps — stagger with subtle scale
    gsap.utils.toArray(".process__step").forEach((step, i) => {
      gsap.from(step, {
        scrollTrigger: { trigger: step, start: "top 88%" },
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.12,
        ease: "power3.out",
      });
    });

    // FAQ items — stagger
    gsap.utils.toArray(".faq__item").forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: "top 92%" },
        y: 24,
        opacity: 0,
        duration: 0.6,
        delay: i * 0.06,
        ease: "power2.out",
      });
    });

    // Testimonials — fade + lift
    gsap.utils.toArray(".testimonial").forEach((t, i) => {
      gsap.from(t, {
        scrollTrigger: { trigger: ".testimonials__viewport", start: "top 80%" },
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: "power2.out",
      });
    });

    // Footer — reveal
    gsap.from(".footer__brand", {
      scrollTrigger: { trigger: ".footer", start: "top 90%" },
      y: 30, opacity: 0, duration: 0.8, ease: "power3.out",
    });
    gsap.from(".footer__col", {
      scrollTrigger: { trigger: ".footer__cols", start: "top 92%" },
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
    });

    // Section heads — soft reveal with blur
    gsap.utils.toArray(".section-head").forEach((head) => {
      gsap.from(head.querySelector(".section-head__index"), {
        scrollTrigger: { trigger: head, start: "top 90%" },
        x: -20, opacity: 0, duration: 0.7, ease: "power2.out",
      });
    });

    // Year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Refresh ScrollTrigger after fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
