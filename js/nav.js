/* ============================================
   NAV — Floating navbar + mobile menu
   ============================================ */

(function () {
  "use strict";

  function init() {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("navBurger");
    const mobileMenu = document.getElementById("mobileMenu");
    const links = document.querySelectorAll("[data-link], .nav__logo, .mobile-menu__link, .hero__scroll");
    const navLinks = document.querySelectorAll(".nav__link");
    const sections = document.querySelectorAll("main section[id]");

    if (!nav) return;

    // ===== Smooth scroll to anchors (uses Lenis if available) =====
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        if (window.__lenis) {
          window.__lenis.scrollTo(target, { offset: -20, duration: 1.4 });
        } else {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // Close mobile menu if open
        closeMobileMenu();
      });
    });

    // ===== Mobile menu toggle =====
    function openMobileMenu() {
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      mobileMenu.classList.remove("is-open");
      mobileMenu.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (burger && mobileMenu) {
      burger.addEventListener("click", () => {
        if (mobileMenu.classList.contains("is-open")) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    // ===== Nav toujours visible (auto-hide désactivé) =====
    let ticking = false;

    function onScroll() {
      // La nav reste fixe (position:fixed) et visible en permanence.
      // On conserve uniquement le scroll-spy ci-dessous pour le lien actif.

      // Active link via scroll-spy
      const threshold = window.innerHeight * 0.4;
      let currentId = "";
      sections.forEach((sec) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > threshold) {
          currentId = sec.id;
        }
      });
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === "#" + currentId) {
          link.classList.add("is-active");
        } else {
          link.classList.remove("is-active");
        }
      });

      ticking = false;
    }

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    // Escape closes mobile menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) {
        closeMobileMenu();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
