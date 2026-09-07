/* ==========================================================================
   Personal webpage — script.js
   Vanilla JS behaviors, no build step, no dependencies (design decision 3).
   Modules: nav toggle, smooth scroll (reduced-motion guard), dark mode
   toggle + localStorage persistence, and the Formspree contact form handler
   (scope amendment — replaces the former email obfuscation module).
   ========================================================================== */

/* --------------------------------------------------------------------------
   Contact form endpoint (scope amendment — Formspree)
   TODO: replace with the real form ID after the user signs up. Swapping this
   one constant is the ONLY change needed for the form to send.
   -------------------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

(function () {
  "use strict";

  /* 1. Nav toggle — hamburger toggles .nav--open and aria-expanded */
  function initNavToggle() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav__toggle");
    if (!nav || !toggle) return;

    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("nav--open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* 2. Smooth scroll — delegated in-page anchor clicks, reduced-motion guard */
  function initSmoothScroll() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = document.querySelector(".nav");

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute("href");
      if (targetId === "#" || targetId.length < 2) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      /* Close the mobile menu before navigating */
      if (nav) {
        nav.classList.remove("nav--open");
        const navToggle = nav.querySelector(".nav__toggle");
        if (navToggle) navToggle.setAttribute("aria-expanded", "false");
      }

      target.scrollIntoView({
        behavior: reducedMotion.matches ? "auto" : "smooth",
        block: "start",
      });
      history.pushState(null, "", targetId);
    });
  }

  /* 3. Dark mode — localStorage override, prefers-color-scheme as default */
  function initDarkMode() {
    const root = document.documentElement;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    root.setAttribute("data-theme", initial);
    updateThemeToggle(toggle, initial);

    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeToggle(toggle, next);
    });
  }

  function updateThemeToggle(toggle, theme) {
    const dark = theme === "dark";
    toggle.textContent = dark ? "Light" : "Dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  /* 4. Contact form — fetch POST to Formspree with idle/sending/success/error states */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const submitButton = form.querySelector(".form-submit");
    const BUTTON_LABEL = "Send message";

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      /* Native validation is enabled; guard against programmatic submits */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setSending(true);

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error("Formspree request failed: " + response.status);
        }

        showSuccess();
      } catch (error) {
        showError();
        setSending(false);
      }
    });

    function setSending(sending) {
      submitButton.disabled = sending;
      submitButton.textContent = sending ? "Sending…" : BUTTON_LABEL;
    }

    function showSuccess() {
      form.innerHTML =
        '<p class="contact-form__status" role="status">Thank you! Your message has been sent.</p>';
    }

    function showError() {
      const existing = form.querySelector(".contact-form__error");
      if (existing) existing.remove();

      const error = document.createElement("p");
      error.className = "contact-form__error";
      error.setAttribute("role", "alert");
      error.textContent = "Sorry, something went wrong. Please try again.";
      form.insertBefore(error, submitButton);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavToggle();
    initSmoothScroll();
    initDarkMode();
    initContactForm();
  });
})();