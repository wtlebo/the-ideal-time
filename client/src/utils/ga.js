// Initialize GA4
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function() {
  window.dataLayer.push(arguments);
};

gtag('js', new Date());
gtag('config', 'G-XFNFXH80SX');

// Queue for events before GA is ready
window._gaQueue = window._gaQueue || [];

// Export tracking functions
export const trackPageView = (page) => {
  // Queue the event
  window._gaQueue.push(['event', 'page_view', {
    page_path: page
  }]);
  
  // Process queue if GA is ready
  if (typeof window.gtag === 'function') {
    window._gaQueue.forEach(event => {
      gtag(...event);
    });
    window._gaQueue = [];
  } else {
    console.log('GA: Event queued - waiting for GA to be ready');
  }
};

export const trackEvent = (action, params = {}) => {
  // Queue the event
  window._gaQueue.push(['event', action, {
    event_category: 'User Interaction',
    ...params
  }]);
  
  // Process queue if GA is ready
  if (typeof window.gtag === 'function') {
    window._gaQueue.forEach(event => {
      gtag(...event);
    });
    window._gaQueue = [];
  } else {
    console.log('GA: Event queued - waiting for GA to be ready');
  }
};
