// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  if (typeof window.gtag === 'function') {
    console.log('GA: gtag function found');
    // Initialize GA with default config
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll handle page views manually
      page_path: window.location.pathname
    });
  } else {
    console.log('GA: gtag function NOT found');
  }
});

export const trackPageView = (page) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track page view', { page });
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: page,
      send_page_view: true
    });
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track event', { action, params });
    window.gtag('event', action, {
      ...params,
      event_category: 'User Interaction',
      send_to: GA_MEASUREMENT_ID
    });
  }
};
