// Replace with your actual Google Analytics Measurement ID
export const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'YOUR_MEASUREMENT_ID';

export const trackPageView = (page) => {
  if (typeof window.ga === 'function') {
    window.ga('set', 'page', page);
    window.ga('send', 'pageview');
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.ga === 'function') {
    window.ga('send', 'event', {
      eventCategory: 'User Interaction',
      eventAction: action,
      eventLabel: JSON.stringify(params),
      transport: 'beacon'
    });
  }
};
