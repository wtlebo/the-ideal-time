// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Wait for GA script to load
  const waitForGtag = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 10;
      const checkGtag = () => {
        attempts++;
        if (typeof window.gtag === 'function') {
          console.log('GA: gtag function found after', attempts, 'attempts');
          resolve(true);
        } else if (attempts < maxAttempts) {
          console.log('GA: gtag not found, retrying...', attempts);
          setTimeout(checkGtag, 1000);
        } else {
          console.log('GA: gtag not found after', maxAttempts, 'attempts');
          reject(new Error('GA initialization failed'));
        }
      };
      checkGtag();
    });
  };

  waitForGtag()
    .then(() => {
      // Initialize GA with default config
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false,
        page_path: window.location.pathname,
        transport_type: 'beacon'
      });
      console.log('GA: Successfully initialized');
    })
    .catch(error => {
      console.error('GA: Initialization failed:', error);
    });
});

export const trackPageView = (page) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track page view', { page });
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: page,
      send_page_view: true,
      transport_type: 'beacon'
    });
  } else {
    console.error('GA: Failed to track page view - gtag not available');
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track event', { action, params });
    window.gtag('event', action, {
      ...params,
      event_category: 'User Interaction',
      send_to: GA_MEASUREMENT_ID,
      transport_type: 'beacon'
    });
  } else {
    console.error('GA: Failed to track event - gtag not available');
  }
};
