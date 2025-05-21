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
  window.gtag = function() {
    dataLayer.push(arguments);
  };
  gtag('js', new Date());
  gtag('config', 'G-XFNFXH80SX', {
    send_page_view: true
  });
`;

// Add scripts to head
console.log('GA: Adding GA scripts to head');
document.head.appendChild(script);
document.head.appendChild(initScript);

// Export tracking functions
export const trackPageView = (page) => {
  console.log('GA: Attempting to track page view', { page });
  try {
    window.gtag('event', 'page_view', {
      page_path: page,
      send_to: 'G-XFNFXH80SX'
    });
    console.log('GA: Page view event sent');
  } catch (error) {
    console.error('GA: Error tracking page view:', error);
  }
};

export const trackEvent = (action, params = {}) => {
  console.log('GA: Attempting to track event', { action, params });
  try {
    window.gtag('event', action, {
      event_category: 'User Interaction',
      ...params,
      send_to: 'G-XFNFXH80SX'
    });
    console.log('GA: Event sent:', { action, params });
  } catch (error) {
    console.error('GA: Error tracking event:', error);
  }
};
