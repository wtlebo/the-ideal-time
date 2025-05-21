// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Initialize GA immediately
  if (typeof window.gtag === 'function') {
    console.log('GA: gtag function found');
    // Send initial page view
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: window.location.pathname,
      send_page_view: true,
      transport_type: 'beacon'
    });
    console.log('GA: Successfully initialized');
  } else {
    console.error('GA: gtag function not found');
  }
});

export const trackPageView = (page) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track page view', { page });
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: page,
      send_page_view: true,
      transport_type: 'beacon'
    });
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
  }
};
