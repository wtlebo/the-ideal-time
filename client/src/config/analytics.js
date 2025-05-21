// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA4 when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Initialize GA4 immediately if gtag is available
  if (typeof window.gtag === 'function') {
    console.log('GA: gtag function found');
    // Send initial page view
    window.gtag('event', 'page_view', {
      page_path: window.location.pathname
    });
    console.log('GA: Successfully initialized');
  } else {
    console.error('GA: gtag function not found');
  }
});

export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  // Track page view using gtag
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: page
    });
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  // Track event using gtag
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: 'User Interaction',
      ...params
    });
  }
};
