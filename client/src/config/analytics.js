// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Initialize tracking queue
  window._gaQueue = window._gaQueue || [];
  
  // Queue initial page view
  window._gaQueue.push(['event', 'page_view', {
    page_path: window.location.pathname
  }]);

  // Process queue immediately if GA is ready
  if (typeof window.gtag === 'function') {
    console.log('GA: gtag function found');
    window._gaQueue.forEach(event => {
      window.gtag(...event);
    });
    window._gaQueue = [];
  }
});

export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  // Queue the page view event
  window._gaQueue = window._gaQueue || [];
  window._gaQueue.push(['event', 'page_view', {
    page_path: page
  }]);
  
  // Process queue if GA is ready
  if (typeof window.gtag === 'function') {
    window._gaQueue.forEach(event => {
      window.gtag(...event);
    });
    window._gaQueue = []; // Clear the queue
  } else {
    console.log('GA: gtag function not available yet');
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  // Queue the event
  window._gaQueue = window._gaQueue || [];
  window._gaQueue.push(['event', action, {
    event_category: 'User Interaction',
    ...params
  }]);
  
  // Process queue if GA is ready
  if (typeof window.gtag === 'function') {
    window._gaQueue.forEach(event => {
      window.gtag(...event);
    });
    window._gaQueue = []; // Clear the queue
  } else {
    console.log('GA: gtag function not available yet');
  }
};
