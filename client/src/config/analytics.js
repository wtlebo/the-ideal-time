// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Wait for GA to be ready
  const waitForGA = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 10;
      
      const checkGA = () => {
        attempts++;
        if (typeof window.ga === 'function') {
          console.log('GA: ga function found after', attempts, 'attempts');
          resolve(true);
        } else if (attempts < maxAttempts) {
          console.log('GA: ga not ready, retrying...', attempts);
          setTimeout(checkGA, 1000);
        } else {
          console.log('GA: ga function not found after', maxAttempts, 'attempts');
          reject(new Error('GA initialization failed'));
        }
      };
      
      checkGA();
    });
  };

  waitForGA()
    .then(() => {
      // Send initial page view
      window.ga('send', 'pageview', {
        page: window.location.pathname,
        hitType: 'pageview'
      });
      console.log('GA: Successfully initialized');
    })
    .catch(error => {
      console.error('GA: Initialization failed:', error);
    });
});

export const trackPageView = (page) => {
  if (typeof window.ga === 'function') {
    console.log('GA: Attempting to track page view', { page });
    window.ga('send', 'pageview', {
      page: page,
      hitType: 'pageview'
    });
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.ga === 'function') {
    console.log('GA: Attempting to track event', { action, params });
    window.ga('send', 'event', {
      eventCategory: 'User Interaction',
      eventAction: action,
      ...params
    });
  }
};
