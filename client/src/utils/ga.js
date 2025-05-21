// Initialize GA4
const script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XFNFXH80SX';
script.async = true;

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

document.head.appendChild(script);
document.head.appendChild(initScript);

// Export tracking functions
export const trackPageView = (page) => {
  try {
    window.gtag('event', 'page_view', {
      page_path: page,
      send_to: 'G-XFNFXH80SX'
    });
  } catch (error) {
    console.error('GA: Error tracking page view:', error);
  }
};

export const trackEvent = (action, params = {}) => {
  try {
    window.gtag('event', action, {
      event_category: 'User Interaction',
      ...params,
      send_to: 'G-XFNFXH80SX'
    });
  } catch (error) {
    console.error('GA: Error tracking event:', error);
  }
};
