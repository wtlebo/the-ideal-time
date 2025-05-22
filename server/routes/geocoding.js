const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { zip } = req.query;
    console.log('Geocoding request received for zip:', zip);
    
    if (!process.env.OPENCAGE_API_KEY) {
      console.error('OpenCage API key is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: zip,
        countrycode: 'us',
        key: process.env.OPENCAGE_API_KEY
      }
    });

    console.log('OpenCage API response:', response.data);
    
    const { results } = response.data;
    if (results.length > 0) {
      const { city, town, village, state_code } = results[0].components;
      const cityName = city || town || village || '';
      res.json({
        city: cityName,
        state: state_code
      });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router;
