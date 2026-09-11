/* ==========================================================================
   Personal webpage — script.js
   Vanilla JS behaviors, no build step, no dependencies (design decision 3).
   Modules: nav toggle, smooth scroll (reduced-motion guard), dark mode
   toggle + localStorage persistence (mirrors the inline head script),
   reveal + scrollspy observers (reduced-motion guards), and the Formspree
   contact form handler
   (scope amendment — replaces the former email obfuscation module).
   ========================================================================== */

/* --------------------------------------------------------------------------
   Contact form endpoint (scope amendment — Formspree)
   Real form registered by the site owner; endpoint hidden from visitors.
   -------------------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdeowprb";

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

  /* 3. Dark mode — mirrors the inline head script precedence
     (localStorage override, prefers-color-scheme as default) */
  function initDarkMode() {
    const root = document.documentElement;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    root.dataset.theme = initial;
    updateThemeToggle(toggle, initial);

    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      localStorage.setItem("theme", next);
      updateThemeToggle(toggle, next);
    });
  }

  function updateThemeToggle(toggle, theme) {
    const dark = theme === "dark";
    const label = toggle.querySelector("[data-theme-label]");
    if (label) label.textContent = dark ? "Light" : "Dark";
    else toggle.textContent = dark ? "Light" : "Dark";
    const moon = toggle.querySelector("[data-theme-icon-moon]");
    const sun = toggle.querySelector("[data-theme-icon-sun]");
    /* When dark, offer the light (sun) icon; when light, offer moon. */
    if (moon && sun) {
      moon.hidden = dark;
      sun.hidden = !dark;
    }
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  /* 5. Reveal — IntersectionObserver adds .is-visible; reduced-motion shows instantly */
  function initReveal() {
    const targets = document.querySelectorAll(".section, .entry, .skills-group");
    if (!targets.length) return;
    targets.forEach((el) => el.classList.add("reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* 6. Scrollspy — one aria-current at a time + .is-scrolled past threshold */
  function initScrollspy() {
    const nav = document.querySelector(".nav");
    const links = Array.from(document.querySelectorAll('.nav__list a[href^="#"]'));
    if (!links.length) return;
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length) return;

    function setActive(id) {
      links.forEach((link) => {
        if (link.getAttribute("href") === "#" + id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    function updateScrolled() {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 4);
    }
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55%" }
    );
    sections.forEach((section) => spy.observe(section));
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
    initReveal();
    initScrollspy();
    initContactForm();
  });
})();