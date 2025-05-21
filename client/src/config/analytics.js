// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Try to use gtag first (GA4)
  if (typeof window.gtag === 'function') {
    console.log('GA: gtag function found');
    // Send initial page view
    window.gtag('event', 'page_view', {
      page_path: window.location.pathname
    });
    console.log('GA: Successfully initialized (GA4)');
  } else if (typeof window.ga === 'function') {
    console.log('GA: ga function found');
    // Send initial page view
    window.ga('send', 'pageview', {
      page: window.location.pathname,
      hitType: 'pageview'
    });
    console.log('GA: Successfully initialized (Universal Analytics)');
  } else {
    console.error('GA: No tracking function found');
  }
});

export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  // Try both gtag and ga
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: page
    });
  } else if (typeof window.ga === 'function') {
    window.ga('send', 'pageview', {
      page: page,
      hitType: 'pageview'
    });
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  // Try both gtag and ga
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: 'User Interaction',
      ...params
    });
  } else if (typeof window.ga === 'function') {
    window.ga('send', 'event', {
      eventCategory: 'User Interaction',
      eventAction: action,
      ...params
    });
  }
};
