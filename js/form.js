/* ============================================
   FORM — Web3Forms submission with UX feedback
   ============================================ */

(function () {
  "use strict";

  function init() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("formStatus");
    const submit = form.querySelector("button[type='submit']");
    const label = submit?.querySelector(".btn__label");
    const originalLabel = label?.textContent;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (status) {
        status.textContent = "Envoi en cours...";
        status.className = "form__status";
      }
      if (submit) submit.disabled = true;
      if (label) label.textContent = "Envoi...";

      const formData = new FormData(form);
      const object = Object.fromEntries(formData);
      // Honeypot
      if (object.botcheck) {
        return;
      }
      const json = JSON.stringify(object);

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: json,
        });

        const data = await res.json();

        if (res.status === 200 && data.success) {
          if (status) {
            status.textContent = "✓ Message envoyé ! On revient vers vous sous 24h.";
            status.className = "form__status is-success";
          }
          form.reset();
          if (label) label.textContent = "Envoyé ✓";
          setTimeout(() => {
            if (label) label.textContent = originalLabel;
          }, 3000);
        } else {
          throw new Error(data.message || "Erreur lors de l'envoi");
        }
      } catch (err) {
        console.error("Form error:", err);
        if (status) {
          status.textContent = "✗ Oups, une erreur s'est produite. Réessayez ou écrivez à dominolaverne24@gmail.com";
          status.className = "form__status is-error";
        }
        if (label) label.textContent = originalLabel;
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
