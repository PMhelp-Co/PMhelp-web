// Newsletter Subscription Handler
function handleNewsletterSubscribe(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById('footer-newsletter-email');
  const submitButton = document.getElementById('newsletter-subscribe-btn');
  const email = emailInput.value.trim();
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    alert('Please enter a valid email address');
    return;
  }
  
  // Show loading state
  submitButton.classList.add('loading');
  submitButton.disabled = true;
  emailInput.disabled = true;
  
  // Track newsletter subscription
  if (window.analytics) {
    window.analytics.trackNewsletterSubscribed(email);
  }

  // REPLACE THIS URL with your actual Beehiiv magic link from dashboard
  const magicLink = `https://magic.beehiiv.com/v1/cb224408-5d64-49b5-bf66-6bec54e0a057?email=${encodeURIComponent(email)}`;
  
  // Redirect to Beehiiv subscription page
  window.location.href = magicLink;
}

