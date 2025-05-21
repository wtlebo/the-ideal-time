// Initialize GA4
console.log('GA: Initializing GA4');

// Create script element
const script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XFNFXH80SX';
script.async = true;

// Create initialization script
const initScript = document.createElement('script');
initScript.innerHTML = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XFNFXH80SX');
`;

// Add scripts to head
console.log('GA: Adding GA scripts to head');
document.head.appendChild(script);
document.head.appendChild(initScript);

// Wait for GA to be ready
let gaReady = false;
const checkGA = () => {
  if (typeof window.gtag === 'function') {
    gaReady = true;
    console.log('GA: GA is ready');
  } else {
    setTimeout(checkGA, 100);
  }
};
checkGA();

// Export tracking functions
export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  if (!gaReady) {
    console.log('GA: GA not ready yet - queueing event');
    window.dataLayer.push(['event', 'page_view', {
      page_path: page
    }]);
    return;
  }
  try {
    gtag('event', 'page_view', {
      page_path: page
    });
    console.log('GA: Page view event sent');
  } catch (error) {
    console.error('GA: Error tracking page view:', error);
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  if (!gaReady) {
    console.log('GA: GA not ready yet - queueing event');
    window.dataLayer.push(['event', action, {
      event_category: 'User Interaction',
      ...params
    }]);
    return;
  }
  try {
    gtag('event', action, {
      event_category: 'User Interaction',
      ...params
    });
    console.log('GA: Event sent:', { action, params });
  } catch (error) {
    console.error('GA: Error tracking event:', error);
  }
};
