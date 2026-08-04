// Shared behaviour for every page: mobile nav toggle + contact form submission.

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initContactForm();
});

function initMobileNav() {
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!menuBtn || !nav) return;

  const menuIcon = menuBtn.querySelector('i');

  const setOpen = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    if (menuIcon) {
      menuIcon.classList.toggle('fa-bars', !open);
      menuIcon.classList.toggle('fa-times', open);
    }
  };

  menuBtn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const statusBox = document.getElementById('formStatus');
  const submitBtn = form.querySelector('button[type="submit"]');

  const showStatus = (message, type) => {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.className = 'form-status visible ' + type;
  };

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Request failed');

      showStatus("Thank you! Your message has been sent — we'll get back to you shortly.", 'success');
      form.reset();
    } catch (err) {
      showStatus('Something went wrong sending your message. Please email us directly instead.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    }
  });
}
