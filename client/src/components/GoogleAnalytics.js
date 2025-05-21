import React, { useEffect } from 'react';

const GoogleAnalytics = () => {
  useEffect(() => {
    // Hardcoding GA ID for testing
    const gaId = 'G-XFNFXH80SX';
    console.log('Initializing Google Analytics with hardcoded ID:', gaId);

    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.onload = () => {
        console.log('Google Analytics script loaded successfully');
        // Initialize GA after script loads
        window.dataLayer = window.dataLayer || [];
        function gtag() {
          dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId);
        console.log('Google Analytics configured successfully');
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Analytics script:', error);
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error initializing Google Analytics:', error);
    }
  }, []);

  return null;
};

export default GoogleAnalytics;
