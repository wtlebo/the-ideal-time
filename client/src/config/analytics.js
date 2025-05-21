// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Initialize GA immediately
  if (typeof window.ga === 'function') {
    console.log('GA: ga function found');
    // Send initial page view
    window.ga('send', 'pageview', {
      page: window.location.pathname,
      hitType: 'pageview'
    });
    console.log('GA: Successfully initialized');
  } else {
    console.error('GA: ga function not found');
  }
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
