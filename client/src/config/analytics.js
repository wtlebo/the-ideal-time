// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

export const trackPageView = (page) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track page view', { page });
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: page
    });
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    console.log('GA: Attempting to track event', { action, params });
    window.gtag('event', action, {
      ...params,
      send_to: GA_MEASUREMENT_ID
    });
  }
};
