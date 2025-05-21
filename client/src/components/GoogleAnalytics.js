import React, { useEffect } from 'react';

const GoogleAnalytics = () => {
  useEffect(() => {
    console.log('GA ID:', process.env.REACT_APP_GA_MEASUREMENT_ID);
    
    if (!process.env.REACT_APP_GA_MEASUREMENT_ID) {
      console.error('Google Analytics ID not found in environment variables');
      return;
    }

    const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    console.log('Initializing Google Analytics with ID:', gaId);

    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      script.onload = () => {
        console.log('Google Analytics script loaded successfully');
      };
      script.onerror = (error) => {
        console.error('Failed to load Google Analytics script:', error);
      };
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId);
      console.log('Google Analytics configured successfully');
    } catch (error) {
      console.error('Error initializing Google Analytics:', error);
    }
  }, []);

  return null;
};

export default GoogleAnalytics;
