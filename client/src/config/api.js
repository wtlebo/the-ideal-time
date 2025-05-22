const API_CONFIG = {
  development: {
    baseUrl: 'https://the-ideal-time-backend-dev.onrender.com'
  },
  production: {
    baseUrl: 'https://the-ideal-time.onrender.com'
  }
};

export const getApiBaseUrl = () => {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  return API_CONFIG[env].baseUrl;
};
