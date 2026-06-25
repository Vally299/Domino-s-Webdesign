/* ============================================
   ROBOT — Cute character with eye tracking
   ============================================ */

(function () {
  "use strict";

  function init() {
    const wrap = document.getElementById("heroRobot");
    if (!wrap) return;

    const robot = wrap.querySelector(".robot");
    const pupils = wrap.querySelectorAll("[data-eye]");
    const mouth = wrap.querySelector("[data-mouth]");
    if (!robot || !pupils.length) return;

    const MAX_PUPIL_OFFSET = 6;
    const MAX_ROTATE = 10;
    const MAX_TILT = 14;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let hovering = false;
    let raf = null;

    function blink() {
      const eyes = wrap.querySelectorAll(".robot__eye");
      eyes.forEach((e) => {
        e.style.animation = "none";
        e.style.transform = "scaleY(0.1)";
      });
      setTimeout(() => {
        eyes.forEach((e) => {
          e.style.transform = "";
          e.style.animation = "";
        });
      }, 140);
    }

    function scheduleBlink() {
      const delay = 2200 + Math.random() * 4000;
      setTimeout(() => {
        blink();
        scheduleBlink();
      }, delay);
    }
    scheduleBlink();

    let waveTimer = null;
    function wave() {
      robot.classList.add("is-happy");
      if (mouth) mouth.style.transform = "scale(1.2)";
      clearTimeout(waveTimer);
      waveTimer = setTimeout(() => {
        robot.classList.remove("is-happy");
        if (mouth) mouth.style.transform = "";
      }, 1200);
    }
    wrap.addEventListener("click", wave);

    function onPointer(e) {
      const rect = robot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = e.clientX - cx;
      const y = e.clientY - cy;
      const nx = Math.max(-1, Math.min(1, x / (rect.width / 1.5)));
      const ny = Math.max(-1, Math.min(1, y / (rect.height / 1.5)));
      targetX = nx;
      targetY = ny;
      hovering = true;
      if (!raf) raf = requestAnimationFrame(loop);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
      hovering = false;
    }

    function loop() {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      pupils.forEach((p) => {
        const px = currentX * MAX_PUPIL_OFFSET;
        const py = currentY * MAX_PUPIL_OFFSET;
        p.style.transform = `translate(${px}px, ${py}px)`;
      });
      const ry = currentX * MAX_TILT;
      const rx = -currentY * MAX_ROTATE;
      const floatY = Math.sin(Date.now() / 1500) * 8;
      robot.style.setProperty("--rx", rx + "deg");
      robot.style.setProperty("--ry", ry + "deg");
      robot.style.setProperty("--tz", floatY + "px");

      if (hovering || Math.abs(currentX) > 0.001 || Math.abs(currentY) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }

    window.addEventListener("mousemove", onPointer, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    window.addEventListener("touchmove", (e) => {
      if (e.touches.length) onPointer(e.touches[0]);
    }, { passive: true });

    window.addEventListener("touchend", () => onLeave());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
