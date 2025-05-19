// Replace with your actual Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID';

export const trackPageView = (page) => {
  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: page,
    });
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      ...params,
    });
  }
};
