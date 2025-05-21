// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Check if GA4 is ready
  if (typeof window.gtag === 'function') {
    console.log('GA: gtag function found');
    // Send initial page view
    window.gtag('event', 'page_view', {
      page_path: window.location.pathname
    });
    console.log('GA: Successfully initialized (GA4)');
    return;
  }
  
  // Check if Universal Analytics is ready
  if (typeof window.ga === 'function') {
    console.log('GA: ga function found');
    // Send initial page view
    window.ga('send', 'pageview', {
      page: window.location.pathname,
      hitType: 'pageview'
    });
    console.log('GA: Successfully initialized (Universal Analytics)');
    return;
  }
  
  // If neither is ready, set up retry mechanism
  console.log('GA: No tracking function found, setting up retry mechanism');
  
  // Retry initialization every second for up to 10 attempts
  const retryGA = () => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkGA = () => {
      attempts++;
      console.log(`GA: Retry attempt ${attempts} of ${maxAttempts}`);
      
      if (typeof window.gtag === 'function') {
        console.log('GA: gtag function found after retry');
        window.gtag('event', 'page_view', {
          page_path: window.location.pathname
        });
        console.log('GA: Successfully initialized (GA4) after retry');
        return;
      }
      
      if (typeof window.ga === 'function') {
        console.log('GA: ga function found after retry');
        window.ga('send', 'pageview', {
          page: window.location.pathname,
          hitType: 'pageview'
        });
        console.log('GA: Successfully initialized (Universal Analytics) after retry');
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkGA, 1000);
      } else {
        console.error('GA: Failed to initialize after', maxAttempts, 'attempts');
      }
    };
    
    checkGA();
  };
  
  retryGA();
});

export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  // Try both gtag and ga
  if (typeof window.gtag === 'function') {
    console.log('GA: Using gtag to track page view');
    window.gtag('event', 'page_view', {
      page_path: page
    });
  } else if (typeof window.ga === 'function') {
    console.log('GA: Using ga to track page view');
    window.ga('send', 'pageview', {
      page: page,
      hitType: 'pageview'
    });
  } else {
    console.error('GA: No tracking function available to track page view');
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  // Try both gtag and ga
  if (typeof window.gtag === 'function') {
    console.log('GA: Using gtag to track event');
    window.gtag('event', action, {
      event_category: 'User Interaction',
      ...params
    });
  } else if (typeof window.ga === 'function') {
    console.log('GA: Using ga to track event');
    window.ga('send', 'event', {
      eventCategory: 'User Interaction',
      eventAction: action,
      ...params
    });
  } else {
    console.error('GA: No tracking function available to track event');
  }
};
