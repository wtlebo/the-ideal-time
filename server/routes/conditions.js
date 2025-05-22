const express = require('express');
const router = express.Router();
const axios = require('axios');
const { haversine } = require('../utils/geo');

router.get('/', async (req, res) => {
  try {
    const { zip, activity } = req.query;
    console.log('Conditions request received:', { zip, activity });

    // 1. Convert ZIP to coordinates using OpenCage
    const geoResponse = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
      params: {
        q: zip,
        key: process.env.OPENCAGE_API_KEY,
        countrycode: 'us'
      }
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      throw new Error('Invalid ZIP code');
    }

    const lat = geoResponse.data.results[0].geometry.lat;
    const lon = geoResponse.data.results[0].geometry.lng;
    const city = geoResponse.data.results[0].components.city || 
                 geoResponse.data.results[0].components.town || 
                 geoResponse.data.results[0].components.village || 
                 geoResponse.data.results[0].components.suburb;
    const state = geoResponse.data.results[0].components.state;

    // 2. Find closest tide station
    const stationsResponse = await axios.get('https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json', {
      params: {
        type: 'waterlevels'
      }
    });

    let closestStation = null;
    let minDistance = Infinity;

    for (const station of stationsResponse.data.stations) {
      try {
        const distance = haversine(lat, lon, parseFloat(station.lat), parseFloat(station.lng));
        if (distance < minDistance) {
          minDistance = distance;
          closestStation = station;
        }
      } catch (error) {
        console.error('Error calculating distance for station:', station.id, error);
      }
    }

    if (!closestStation) {
      throw new Error('No tide station found');
    }

    // 3. Get tide predictions
    const now = new Date();
    const start = now.toISOString().split('T')[0];
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const tideResponse = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
      params: {
        product: 'predictions',
        application: 'wateractivity',
        begin_date: start,
        end_date: end,
        station: closestStation.id,
        datum: 'MLLW',
        units: 'english',
        time_zone: 'lst_ldt',
        format: 'json'
      }
    });

    // 4. Get weather forecast
    const weatherResponse = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: `${lat},${lon}`,
        days: 2
      }
    });

    // 5. Combine data into forecast
    const forecast = weatherResponse.data.forecast.forecastday.reduce((acc, day) => {
      return [...acc, ...day.hour.map(hour => ({
        time: hour.time,
        tide: getTideAtTime(hour.time, tideResponse.data.predictions),
        temperature: hour.temp_f,
        windSpeed: hour.wind_mph,
        skyCover: hour.cloud,
        precipChance: hour.chance_of_rain,
        daylight: isDaylight(hour.time, lat, lon)
      }))];
    }, []);

    res.json({
      forecast,
      station_id: closestStation.id,
      station_name: closestStation.name,
      station_distance_miles: minDistance,
      timezone: weatherResponse.data.location.tz_id
    });

  } catch (error) {
    console.error('Conditions error:', error);
    res.status(500).json({ error: 'Failed to fetch conditions' });
  }
});

// Helper functions
function getTideAtTime(time, predictions) {
  const targetTime = new Date(time).getTime();
  const closestPrediction = predictions.reduce((prev, curr) => {
    return Math.abs(new Date(curr.t).getTime() - targetTime) < 
           Math.abs(new Date(prev.t).getTime() - targetTime) ? curr : prev;
  });
  return parseFloat(closestPrediction.v);
}

function isDaylight(time, lat, lon) {
  const dt = new Date(time);
  const sunrise = new Date(dt);
  const sunset = new Date(dt);
  
  // Calculate sunrise and sunset times using a simpler approach
  const utcOffset = dt.getTimezoneOffset() / 60; // Convert to hours
  const localHour = dt.getUTCHours() + utcOffset;
  
  // Approximate sunrise/sunset times based on latitude
  const sunriseHour = 6 - (lat / 10); // Rough approximation
  const sunsetHour = 18 + (lat / 10);
  
  return localHour >= sunriseHour && localHour < sunsetHour;
}

module.exports = router;
