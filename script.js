document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initServiceTabs();
  initContactForm();
  initRevealAnimations();
  setCurrentYear();
});

function initNavigation() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.getElementById("primary-navigation");
  const submenuButtons = document.querySelectorAll("[data-submenu-toggle]");

  const setMenuOpen = (open) => {
    if (!menuButton || !nav) return;
    nav.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
    const icon = menuButton.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
  };

  menuButton?.addEventListener("click", () =>
    setMenuOpen(!nav.classList.contains("open")),
  );

  submenuButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const item = button.closest(".nav-item");
      if (!item) return;
      const willOpen = !item.classList.contains("submenu-open");
      document
        .querySelectorAll(".nav-item.submenu-open")
        .forEach((openItem) => {
          openItem.classList.remove("submenu-open");
          openItem
            .querySelector("[data-submenu-toggle]")
            ?.setAttribute("aria-expanded", "false");
        });
      item.classList.toggle("submenu-open", willOpen);
      button.setAttribute("aria-expanded", String(willOpen));
    });
  });

  nav
    ?.querySelectorAll("a")
    .forEach((link) =>
      link.addEventListener("click", () => setMenuOpen(false)),
    );
  document.addEventListener("click", (event) => {
    if (event.target.closest(".nav-item")) return;
    submenuButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button.closest(".nav-item")?.classList.remove("submenu-open");
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setMenuOpen(false);
    submenuButtons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button.closest(".nav-item")?.classList.remove("submenu-open");
    });
    menuButton?.focus();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setMenuOpen(false);
  });
}

function initServiceTabs() {
  const tabList = document.querySelector("[data-service-tabs]");
  if (!tabList) return;
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const cards = [...document.querySelectorAll("[data-service-category]")];
  const status = document.querySelector("[data-tab-status]");

  const activateTab = (tab) => {
    const filter = tab.dataset.filter;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    let visibleCount = 0;
    cards.forEach((card) => {
      const visible =
        filter === "all" || card.dataset.serviceCategory === filter;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    if (status)
      status.textContent = `${visibleCount} ${visibleCount === 1 ? "service" : "services"} shown for ${tab.textContent.trim()}.`;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const serviceSelect = form.querySelector("#service");
  const subjectInput = form.querySelector("#subject");
  const status = document.getElementById("formStatus");
  const submitButton = form.querySelector(".form-submit");
  const query = new URLSearchParams(window.location.search);
  const requestedService = query.get("service");
  const requestedFocus = query.get("focus");

  if (requestedService && serviceSelect) {
    const option = [...serviceSelect.options].find(
      (item) => item.value === requestedService,
    );
    if (option) {
      serviceSelect.value = requestedService;
      if (subjectInput && !subjectInput.value) {
        const itFocusLabels = {
          "systems-development": "systems development",
          "mobile-apps": "a mobile app",
          "web-apps": "a web application",
          websites: "a website",
        };
        const focusLabel =
          requestedService === "it-solutions" && requestedFocus
            ? itFocusLabels[requestedFocus]
            : null;
        subjectInput.value = focusLabel
          ? `Enquiry about ${focusLabel}`
          : `Enquiry about ${option.textContent}`;
      }
    }
  }

  const showStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status visible ${type}`;
    status.focus({ preventScroll: true });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const originalText = submitButton?.innerHTML;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Sending';
    }
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error("Message could not be sent");
      showStatus(
        "Thank you. Your enquiry has been sent and the Chomene team will follow up with you.",
        "success",
      );
      form.reset();
    } catch (error) {
      showStatus(
        "We could not send the form. Please email isaacians36@gmail.com or call +260 976 898 797.",
        "error",
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    }
  });
}

function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;
  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    elements.forEach((element) => element.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        instance.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  elements.forEach((element) => observer.observe(element));
}

function setCurrentYear() {
  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
}

/* Back to top button — injected once per page so long pages stay usable */
document.addEventListener("DOMContentLoaded", initBackToTop);

function initBackToTop() {
  const btn = document.createElement("button");
  btn.id = "back-to-top";
  btn.className = "back-to-top";
  btn.setAttribute("type", "button");
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  const updateVisibility = () =>
    btn.classList.toggle("visible", window.scrollY > 480);
  updateVisibility();
  window.addEventListener("scroll", updateVisibility);
  document.body.appendChild(btn);
}
