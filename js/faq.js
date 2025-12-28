// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Generate FAQs from data
  const faqContainer = document.getElementById('faq-container');
  
  if (faqContainer && typeof faqData !== 'undefined') {
    faqData.forEach((item, index) => {
      const faqElement = document.createElement('div');
      faqElement.className = 'faq';
      faqElement.innerHTML = `
        <h3 class="faq-title">${item.question}</h3>
        <p class="faq-text">${item.answer}</p>
        <button class="faq-toggle">
          <i class="faq-icon faq-chevron">+</i>
          <i class="faq-icon faq-close">−</i>
        </button>
      `;
      faqContainer.appendChild(faqElement);
    });
  }

  // Initialize accordion functionality after FAQs are generated
  setTimeout(() => {
    const faqs = document.querySelectorAll('.faq');
    const toggles = document.querySelectorAll('.faq-toggle');

    toggles.forEach((toggle, index) => {
      toggle.addEventListener('click', () => {
        // Toggle the active class on the clicked FAQ
        faqs[index].classList.toggle('active');
      });

      // Also allow clicking on the title to toggle
      const faqTitle = faqs[index].querySelector('.faq-title');
      if (faqTitle) {
        faqTitle.addEventListener('click', () => {
          faqs[index].classList.toggle('active');
        });
      }
    });
  }, 100);
});

