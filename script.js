// Handle simple contact form submission

document.getElementById('contactForm').addEventListener('submit', function(event) {
  event.preventDefault();

  alert("Thank you for contacting Chiomene. We will get back to you shortly!");

  // Optionally reset form
  this.reset();
});
