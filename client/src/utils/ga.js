// Initialize GA4
gtag('js', new Date());
gtag('config', 'G-XFNFXH80SX');

// Export tracking functions
export const trackPageView = (page) => {
  gtag('event', 'page_view', {
    page_path: page
  });
};

export const trackEvent = (action, params = {}) => {
  gtag('event', action, {
    event_category: 'User Interaction',
    ...params
  });
};
