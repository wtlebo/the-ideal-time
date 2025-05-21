// Replace with your actual Google Analytics Measurement ID
// Format should be G-XXXXXXXXXX for GA4
export const GA_MEASUREMENT_ID = 'G-XFNFXH80SX';

// Initialize GA when the window loads
window.addEventListener('load', () => {
  console.log('GA: Window loaded, checking GA initialization');
  
  // Wait for GA script to load
  const waitForGAScript = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = 1000;
      
      const checkGA = () => {
        attempts++;
        
        // Check if GA script is loaded
        const script = document.querySelector('script[src*="gtag.js"]');
        if (script && script.readyState === 'loaded') {
          console.log('GA: GA script loaded successfully');
          resolve(true);
          return;
        }
        
        // Check if GA function is available
        if (typeof window.gtag === 'function') {
          console.log('GA: gtag function found');
          resolve(true);
          return;
        }
        
        if (attempts >= maxAttempts) {
          console.error('GA: Failed to load after', maxAttempts, 'attempts');
          reject(new Error('GA script failed to load'));
          return;
        }
        
        console.log('GA: Waiting for GA script to load... attempt', attempts);
        setTimeout(checkGA, checkInterval);
      };
      
      checkGA();
    });
  };

  // Initialize tracking queue
  window._gaQueue = window._gaQueue || [];
  
  // Queue initial page view
  window._gaQueue.push(['event', 'page_view', {
    page_path: window.location.pathname
  }]);

  // Wait for GA to be ready before processing queue
  waitForGAScript()
    .then(() => {
      console.log('GA: Processing queued events');
      window._gaQueue.forEach(event => {
        window.gtag(...event);
      });
      window._gaQueue = [];
    })
    .catch(error => {
      console.error('GA: Failed to initialize:', error);
    });
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
