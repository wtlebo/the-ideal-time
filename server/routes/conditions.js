const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { zip, activity } = req.query;
    console.log('Conditions request received:', { zip, activity });

    // Fetch weather data from Weather API
    const weatherResponse = await axios.get('https://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: zip,
        days: 2
      }
    });

    // Fetch tide data from NOAA API
    const tideResponse = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
      params: {
        product: 'predictions',
        application: process.env.NOAA_API_KEY,
        begin_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        station: process.env.NOAA_STATION_ID,
        datum: 'MLLW',
        units: 'english',
        time_zone: 'lst_ldt',
        format: 'json'
      }
    });

    // Combine weather and tide data into forecast
    const forecast = weatherResponse.data.forecast.forecastday.reduce((acc, day) => {
      return [...acc, ...day.hour.map(hour => ({
        time: hour.time,
        tide: getTideAtTime(hour.time, tideResponse.data.predictions),
        temperature: hour.temp_f,
        windSpeed: hour.wind_mph,
        skyCover: hour.cloud,
        precipChance: hour.chance_of_rain,
        daylight: isDaylight(hour.time, day.astro.sunrise, day.astro.sunset)
      }))];
    }, []);

    res.json({
      forecast,
      station_id: process.env.NOAA_STATION_ID,
      station_name: 'Boston Harbor',
      station_distance_miles: 10,
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
    return Math.abs(curr.v - targetTime) < Math.abs(prev.v - targetTime) ? curr : prev;
  });
  return closestPrediction.v;
}

function isDaylight(time, sunrise, sunset) {
  const hourTime = new Date(time).getHours();
  const sunriseHour = parseInt(sunrise.split(':')[0]);
  const sunsetHour = parseInt(sunset.split(':')[0]);
  return hourTime >= sunriseHour && hourTime < sunsetHour;
}

module.exports = router;
