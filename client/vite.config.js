export default {
  server: {
    proxy: {
      '/conditions': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
