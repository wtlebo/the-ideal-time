import { GA4 } from 'react-ga4';

// Initialize GA4
GA4.initialize('G-XFNFXH80SX');

// Export tracking functions
export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  try {
    GA4.pageview(page);
  } catch (error) {
    console.error('GA: Error tracking page view:', error);
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  try {
    GA4.event(action, {
      category: 'User Interaction',
      ...params
    });
  } catch (error) {
    console.error('GA: Error tracking event:', error);
  }
};
