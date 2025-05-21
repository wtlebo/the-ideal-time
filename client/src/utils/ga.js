export const initializeGA = () => {
  // Initialize GA4
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };
  gtag('js', new Date());
  gtag('config', 'G-XFNFXH80SX');
};

// Export tracking functions
export const trackPageView = (page) => {
  if (typeof window.gtag === 'function') {
    gtag('event', 'page_view', {
      page_path: page
    });
  } else {
    console.warn('GA: gtag not available yet');
  }
};

export const trackEvent = (action, params = {}) => {
  if (typeof window.gtag === 'function') {
    gtag('event', action, {
      event_category: 'User Interaction',
      ...params
    });
  } else {
    console.warn('GA: gtag not available yet');
  }
};
