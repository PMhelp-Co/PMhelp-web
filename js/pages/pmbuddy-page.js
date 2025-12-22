// =====================================================
// PM Buddy Page - Form Handling
// =====================================================
// Handles mentee/mentor form submissions and UI
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  // Form elements
  const menteeForm = document.getElementById('mentee-form');
  const mentorForm = document.getElementById('mentor-form');
  const formToggleButtons = document.querySelectorAll('.form-toggle-btn');
  const activeFormType = { current: 'mentee' }; // Track which form is active

  // Goal selection buttons
  const goalButtons = document.querySelectorAll('.goal-button');
  const selectedGoals = new Set();

  // Message display
  const messageDiv = document.getElementById('pmbuddy-message');

  // =====================================================
  // Initialize
  // =====================================================
  init();

  function init() {
    // Setup form toggle
    setupFormToggle();
    
    // Setup goal selection
    setupGoalSelection();
    
    // Setup form submissions
    setupFormSubmissions();
  }

  // =====================================================
  // Form Toggle (Mentee/Mentor)
  // =====================================================
  function setupFormToggle() {
    formToggleButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const targetType = this.dataset.type; // 'mentee' or 'mentor'
        const isHeroButton = this.classList.contains('hero-cta-btn');
        
        // If this is a hero button, scroll to forms section first
        if (isHeroButton) {
          const formsSection = document.getElementById('interest-forms');
          if (formsSection) {
            formsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Wait a bit for scroll to start, then toggle form
            setTimeout(() => {
              toggleForm(targetType);
            }, 300);
            return;
          }
        }
        
        // Regular form toggle (no scrolling)
        toggleForm(targetType);
      });
    });
  }

  // =====================================================
  // Toggle Form Helper
  // =====================================================
  function toggleForm(targetType) {
    if (targetType === activeFormType.current) return;

    // Update active state
    activeFormType.current = targetType;
    
    // Update button styles
    formToggleButtons.forEach(b => {
      if (b.dataset.type === targetType) {
        b.classList.add('active');
        b.classList.remove('inactive');
      } else {
        b.classList.remove('active');
        b.classList.add('inactive');
      }
    });

    // Show/hide forms
    if (menteeForm && mentorForm) {
      if (targetType === 'mentee') {
        menteeForm.classList.remove('hidden');
        mentorForm.classList.add('hidden');
      } else {
        menteeForm.classList.add('hidden');
        mentorForm.classList.remove('hidden');
      }
    }
  }


  // =====================================================
  // Goal Selection (Multi-select buttons)
  // =====================================================
  function setupGoalSelection() {
    goalButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const goal = this.dataset.goal;
        
        if (selectedGoals.has(goal)) {
          // Deselect
          selectedGoals.delete(goal);
          this.classList.remove('selected');
        } else {
          // Select
          selectedGoals.add(goal);
          this.classList.add('selected');
        }
      });
    });
  }

  function resetGoalSelection() {
    selectedGoals.clear();
    goalButtons.forEach(btn => {
      btn.classList.remove('selected');
    });
  }

  // =====================================================
  // Form Submissions
  // =====================================================
  function setupFormSubmissions() {
    if (menteeForm) {
      menteeForm.addEventListener('submit', handleFormSubmit.bind(null, 'mentee'));
    }
    
    if (mentorForm) {
      mentorForm.addEventListener('submit', handleFormSubmit.bind(null, 'mentor'));
    }
  }

  async function handleFormSubmit(type, e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent;

    // Disable submit button
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }

    // Hide previous messages
    hideMessage();

    try {
      // Check authentication for mentees (mentors don't need to be signed in)
      if (type === 'mentee') {
        if (!window.AuthState || !window.AuthState.getIsAuthenticated()) {
          showMessage('You need to sign in or create an account to continue as a mentee. Please sign in and try again.', true);
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          }
          // Redirect to sign in page after showing message
          setTimeout(() => {
            window.location.href = 'signin.html?redirect=' + encodeURIComponent(window.location.pathname);
          }, 2000);
          return;
        }
      }

      // Get form data
      const formData = getFormData(form, type);

      // Validate
      const validation = validateFormData(formData, type);
      if (!validation.valid) {
        showMessage(validation.error, true);
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
        return;
      }

      // Submit to API
      if (!window.PMBuddyAPI) {
        throw new Error('PM Buddy API not loaded');
      }

      const result = await window.PMBuddyAPI.submitApplication(type, formData);

      if (result.success) {
        showMessage(result.message || 'Application submitted successfully!', false);
        // Reset form
        form.reset();
        resetGoalSelection();
        // Note: scrollToMessage is called inside showMessage()
      } else {
        // Show friendly error messages instead of raw API errors
        let errorMessage = result.error || 'Failed to submit application. Please try again.';
        
        // Replace technical errors with user-friendly messages
        if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
          errorMessage = 'You need to sign in to continue. Please sign in and try again.';
        } else if (errorMessage.includes('JWT') || errorMessage.includes('token')) {
          errorMessage = 'Your session has expired. Please sign in again and try again.';
        }
        
        showMessage(errorMessage, true);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      
      // Show friendly error messages
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        errorMessage = 'You need to sign in to continue. Please sign in and try again.';
      }
      
      showMessage(errorMessage, true);
    } finally {
      // Re-enable submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  }

  // =====================================================
  // Get Form Data
  // =====================================================
  function getFormData(form, type) {
    const formData = {
      fullName: form.querySelector(`#${type}-name`)?.value.trim() || '',
      email: form.querySelector(`#${type}-email`)?.value.trim() || '',
      linkedinUrl: form.querySelector(`#${type}-linkedin`)?.value.trim() || '',
      industry: form.querySelector(`#${type}-industry`)?.value || '',
      experienceLevel: form.querySelector(`#${type}-experience`)?.value || '',
      goals: Array.from(selectedGoals),
      additionalInfo: form.querySelector(`#${type}-additional`)?.value.trim() || ''
    };

    return formData;
  }

  // =====================================================
  // Validate Form Data
  // =====================================================
  function validateFormData(formData, type) {
    // Required fields
    if (!formData.fullName) {
      return { valid: false, error: 'Please enter your full name.' };
    }

    if (!formData.email) {
      return { valid: false, error: 'Please enter your email address.' };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }

    if (!formData.linkedinUrl) {
      return { valid: false, error: 'Please enter your LinkedIn profile URL.' };
    }

    // LinkedIn URL validation (basic)
    if (!formData.linkedinUrl.includes('linkedin.com')) {
      return { valid: false, error: 'Please enter a valid LinkedIn profile URL.' };
    }

    // Goals validation
    if (!formData.goals || formData.goals.length === 0) {
      return { valid: false, error: 'Please select at least one goal.' };
    }

    return { valid: true };
  }

  // =====================================================
  // Show Message
  // =====================================================
  function showMessage(text, isError = false) {
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.className = `pmbuddy-message ${isError ? 'error' : 'success'}`;
    messageDiv.style.display = 'block';

    // Scroll to message after a brief delay to ensure it's rendered
    setTimeout(() => {
      scrollToMessage();
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      hideMessage();
    }, 5000);
  }

  // =====================================================
  // Scroll to Message
  // =====================================================
  function scrollToMessage() {
    if (!messageDiv) return;
    
    // Calculate the position to scroll to (message position minus some offset for better visibility)
    const messagePosition = messageDiv.getBoundingClientRect().top + window.pageYOffset;
    const offset = 100; // Offset from top of viewport
    
    window.scrollTo({
      top: messagePosition - offset,
      behavior: 'smooth'
    });
  }

  // =====================================================
  // Hide Message
  // =====================================================
  function hideMessage() {
    if (messageDiv) {
      messageDiv.style.display = 'none';
    }
  }
});
