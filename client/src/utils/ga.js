// Initialize GA4
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
window.gtag = gtag;

gtag('js', new Date());
gtag('config', 'G-XFNFXH80SX');

// Export tracking functions
export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  try {
    gtag('event', 'page_view', {
      page_path: page
    });
  } catch (error) {
    console.error('GA: Error tracking page view:', error);
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  try {
    gtag('event', action, {
      event_category: 'User Interaction',
      ...params
    });
  } catch (error) {
    console.error('GA: Error tracking event:', error);
  }
};
