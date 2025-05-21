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
  
  // Process queued events when GA is ready
  const processQueue = () => {
    if (typeof window.gtag === 'function') {
      console.log('GA: gtag function found, processing queue');
      window._gaQueue.forEach(event => {
        window.gtag(...event);
      });
      window._gaQueue = []; // Clear the queue
      return true;
    }
    return false;
  };
  
  // Process queue immediately if GA is ready
  processQueue();
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
  }
};
