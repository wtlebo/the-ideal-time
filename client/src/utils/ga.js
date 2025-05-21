import { initialize, pageview, event } from 'react-ga4';

// Initialize GA4
initialize('G-XFNFXH80SX');

// Export tracking functions
export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  try {
    pageview(page);
  } catch (error) {
    console.error('GA: Error tracking page view:', error);
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  try {
    event(action, {
      category: 'User Interaction',
      ...params
    });
  } catch (error) {
    console.error('GA: Error tracking event:', error);
  }
};
