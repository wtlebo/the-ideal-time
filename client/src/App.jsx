import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
import { GearIcon } from '@radix-ui/react-icons';
import { activityDefaults } from './config/activityDefaults';
import { trackPageView, trackEvent } from './config/analytics';

// Test log to verify app loading
console.log('APP: Application loaded');

function App() {
  const [zipCode, setZipCode] = useState(() => localStorage.getItem('zipCode') || '');
  const [activity, setActivity] = useState('paddleboarding');
  const [forecast, setForecast] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationDistance, setStationDistance] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [zipError, setZipError] = useState(false);
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track page view
  useEffect(() => {
    console.log('GA: Attempting to track page view');
    if (typeof window.ga === 'function') {
      console.log('GA: ga function found');
      trackPageView(window.location.pathname);
    } else {
      console.log('GA: ga function NOT found');
    }
  }, []);

  const scoringConfig = activityDefaults[activity];

  const [tideRange, setTideRange] = useState(() => {
    const stored = localStorage.getItem(`tide_ft_${activity}`);
    return stored ? JSON.parse(stored) : scoringConfig.tideRange;
  });
  const [temperatureRange, setTemperatureRange] = useState(() => {
    const stored = localStorage.getItem(`temperature_°f_${activity}`);
    return stored ? JSON.parse(stored) : scoringConfig.temperatureRange;
  });
  const [windSpeedRange, setWindSpeedRange] = useState(() => {
    const stored = localStorage.getItem(`windSpeed_mph_${activity}`);
    return stored ? JSON.parse(stored) : scoringConfig.windSpeedRange;
  });
  const [skyCoverRange, setSkyCoverRange] = useState(() => {
    const stored = localStorage.getItem(`skyCover_%_${activity}`);
    return stored ? JSON.parse(stored) : scoringConfig.skyCoverRange;
  });
  const [precipChanceRange, setPrecipChanceRange] = useState(() => {
    const stored = localStorage.getItem(`precipChance_%_${activity}`);
    return stored ? JSON.parse(stored) : scoringConfig.precipChanceRange;
  });
  const [daylightRange, setDaylightRange] = useState(() => {
    const stored = localStorage.getItem(`daylightRange_${activity}`);
    return stored ? JSON.parse(stored) : scoringConfig.daylightRange;
  });

  useEffect(() => {
    if (/^\d{5}$/.test(zipCode)) {
      fetchConditions();
    }
  }, [zipCode]);


  const fetchConditions = async () => {
    console.log('GA: Attempting to track zip search', { zipCode });
    if (typeof window.ga === 'function') {
      console.log('GA: ga function found');
      trackEvent('zip_search', { zip_code: zipCode });
    } else {
      console.log('GA: ga function NOT found');
    }
    let newForecast = [];
    setZipError(false);
    setLocationName('');
    if (!zipCode) return;
    setLoading(true);
    // Default sunrise/sunset fallback
    const sunrise = 360; // 6 AM
    const sunset = 1080; // 6 PM
    try {
      const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${zipCode}&countrycode=us&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`);
      const geoData = await geoRes.json();
      if (geoData.results.length > 0) {
        const { city, town, village, state_code } = geoData.results[0].components;
        const cityName = city || town || village || '';
        setLocationName(`${cityName}, ${state_code}`);
      }
    } catch (e) {
      console.warn('Could not fetch city/state:', e);
    }

    try {
      const params = new URLSearchParams({
        zip: zipCode,
        activity
      });
      const response = await fetch(`https://the-ideal-time.onrender.com/conditions?${params.toString()}`);
      const data = await response.json();
      newForecast = data.forecast || [];
      setStationId(data.station_id || '');
      setStationName(data.station_name || '');
      setStationDistance(data.station_distance_miles || null);
      setTimeZone(data.timezone || 'America/New_York');
      if (newForecast.length > 0) {
        setForecast(scoreForecast(newForecast));
      } else {
        setForecast([]);
        setZipError(true);
      }
    } catch (error) {
      console.error('Error fetching conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const handleRestoreDefaults = () => {
    const defaults = activityDefaults[activity];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    setDaylightRange(defaults.daylightRange);
    //localStorage.setItem('daylightRange', JSON.stringify(defaultDaylight)); //delete this?
  };

  const handleApplySettings = () => {
    console.log('GA: Attempting to track settings applied');
    if (typeof window.ga === 'function') {
      console.log('GA: ga function found');
      trackEvent('settings_applied', {
        activity,
        settings: {
          tideRange,
          temperatureRange,
          windSpeedRange,
          skyCoverRange,
          precipChanceRange,
          daylightRange
        }
      });
    } else {
      console.log('GA: ga function NOT found');
    }
    trackEvent('settings_applied', {
      activity,
      settings: {
        tideRange,
        temperatureRange,
        windSpeedRange,
        skyCoverRange,
        precipChanceRange,
        daylightRange
      }
    });
    setShowSettings(false);
  };

  const handleActivityChange = (e) => {
    console.log('GA: Attempting to track activity change', { new_activity: e.target.value });
    if (typeof window.ga === 'function') {
      console.log('GA: ga function found');
      trackEvent('activity_changed', { new_activity: e.target.value });
    } else {
      console.log('GA: ga function NOT found');
    }
    const selected = e.target.value;
    trackEvent('activity_changed', { new_activity: selected });
    setActivity(selected);
    const defaults = activityDefaults[selected];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    setDaylightRange(defaults.daylightRange);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchConditions();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 6) return 'bg-green-500';
    if (score === 5) return 'bg-yellow-400';
    if (score === 4) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const scoreForecast = (rawForecast) => {
    return rawForecast.map(entry => {
      let score = 0;
      if (entry.tideHeight !== null && tideRange[0] <= entry.tideHeight && entry.tideHeight <= tideRange[1]) score++;
      if (entry.temperature !== null && temperatureRange[0] <= entry.temperature && entry.temperature <= temperatureRange[1]) score++;
      if (entry.windSpeed !== null && windSpeedRange[0] <= entry.windSpeed && entry.windSpeed <= windSpeedRange[1]) score++;
      if (entry.skyCover !== null && skyCoverRange[0] <= entry.skyCover && entry.skyCover <= skyCoverRange[1]) score++;
      if (entry.precipChance !== null && precipChanceRange[0] <= entry.precipChance && entry.precipChance <= precipChanceRange[1]) score++;
      const entryMinutes = new Date(entry.time).getHours() * 60 + new Date(entry.time).getMinutes();
      if (entryMinutes >= daylightRange[0] && entryMinutes <= daylightRange[1]) score++;
      return { ...entry, score };
    });
  };

  useEffect(() => {
    setForecast(scoreForecast(forecast));
  }, [activity, tideRange, temperatureRange, windSpeedRange, skyCoverRange, precipChanceRange, daylightRange]);

  const formatDateTime = (isoString, timeZone = 'America/New_York') => {
    const options = {
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone
    };
    return new Intl.DateTimeFormat(undefined, options).format(new Date(isoString));
  };

  const formatDetailDateTime = (isoString, timeZone = 'America/New_York') => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone
    };
    return new Intl.DateTimeFormat(undefined, options).format(new Date(isoString));
  };

  const renderSlider = (label, min, max, step, values, setValues, unit) => (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-white mb-1">{label}</label>
      <div className="flex items-center gap-4">
        {unit !== 'min' && <span className="text-sm w-10 text-gray-100">{min}</span>}
        <Range
          values={values}
          step={step}
          min={min}
          max={max}
          onChange={(values) => {
            setValues(values);
            if (unit === 'min') {
              localStorage.setItem(`daylightRange_${activity}`, JSON.stringify(values));
            } else {
              localStorage.setItem(`${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${activity}`, JSON.stringify(values));
            }
          }}
          renderTrack={({ props, children }) => {
            const trackStyle = {
              height: '6px',
              width: '100%',
              display: 'flex'
            };

            const backgroundStyles = [
              {
                flex: `${(values[0] - min) / (max - min)}`,
                backgroundColor: '#ccc',
                height: '4px',
                alignSelf: 'center'
              },
              {
                flex: `${(values[1] - values[0]) / (max - min)}`,
                backgroundColor: '#0d9488',
                height: '6px',
                alignSelf: 'center'
              },
              {
                flex: `${(max - values[1]) / (max - min)}`,
                backgroundColor: '#ccc',
                height: '4px',
                alignSelf: 'center'
              }
            ];

            return (
              <div {...props} style={{ ...props.style, ...trackStyle }}>
                {backgroundStyles.map((style, idx) => (
                  <div key={idx} style={style} />
                ))}
                {children}
              </div>
            );
          }}
          renderThumb={({ props }) => (
            <div
              {...props}
              className="h-4 w-4 bg-white border border-gray-400 rounded-full shadow"
            />
          )}
        />
        {unit !== 'min' && <span className="text-sm w-10 text-gray-100">{max}</span>}
      </div>
      <div className="text-sm mt-1 text-gray-300">
        Selected: {unit === 'min' ? `${formatMinutes(values[0])} - ${formatMinutes(values[1])}` : `${values[0]} ${unit} - ${values[1]} ${unit}`}
      </div>
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex justify-center mb-4">
        <img src="/logo.png" alt="The Ideal Time" className="w-full max-h-96 object-contain" />
      </div>

      {loading && (
        <div className="flex justify-center mb-2">
          
        </div>
      )}

      <div className="flex gap-2 items-center mb-1">
        <input
          type="text"
          placeholder="ZIP"
          className="border rounded px-2 py-1 w-24 h-[32px]"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          />
        <select
          className="border rounded px-2 py-1 h-[32px] flex-grow"
          value={activity}
          onChange={handleActivityChange}
        >
          {Object.keys(activityDefaults).map((key) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="bg-blue-600 text-white px-4 py-1 rounded h-[32px] flex items-center justify-center"
          title="Preferences"
        >
          <GearIcon className="w-4 h-4" />
        </button>
        <button
          onClick={fetchConditions}
          className="bg-blue-600 text-white px-4 py-1 rounded h-[32px]"
        >
          Check
        </button>
      </div>

      {locationName && (
        <div className="text-sm text-center text-gray-300 mb-2">{locationName}</div>
      )}

      {zipError && (
        <div className="text-red-500 text-center font-semibold mb-4">Please enter a valid ZIP code</div>
      )}


      {showSettings && (
        <div className="mb-6 border rounded p-4 bg-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">
            Ideal conditions for {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </h2>
          {renderSlider('Time of Day', scoringConfig.daylightMin, scoringConfig.daylightMax, 15, daylightRange, setDaylightRange, 'min')}
          {renderSlider('Temperature (°F)', scoringConfig.temperatureMin, scoringConfig.temperatureMax, 1, temperatureRange, setTemperatureRange, '°F')}
          {renderSlider('Wind Speed (mph)', scoringConfig.windSpeedMin, scoringConfig.windSpeedMax, 1, windSpeedRange, setWindSpeedRange, 'mph')}
          {renderSlider('Sky Cover (%)', scoringConfig.skyCoverMin, scoringConfig.skyCoverMax, 1, skyCoverRange, setSkyCoverRange, '%')}
          {renderSlider('Precipitation Chance (%)', scoringConfig.precipChanceMin, scoringConfig.precipChanceMax, 1, precipChanceRange, setPrecipChanceRange, '%')}
          {renderSlider('Tide (ft)', scoringConfig.tideMin, scoringConfig.tideMax, 0.1, tideRange, setTideRange, 'ft')}
          <div className="mt-4 flex justify-between items-center gap-2">
            <button
              onClick={handleRestoreDefaults}
              className="text-sm bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded"
            >
              Restore Defaults
            </button>
            <button
              onClick={handleApplySettings}
              className="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {!showSettings && !zipError && (
        <div className="h-[500px] overflow-y-auto space-y-1">
          {loading && <p>Loading...</p>}
          {forecast.map((hour, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between px-4 py-2 rounded cursor-pointer ${getScoreColor(hour.score)} ${selectedHour === idx ? 'border-4 border-white' : ''}`}
              onClick={() => setSelectedHour(selectedHour === idx ? null : idx)}
            >
              <div className="text-sm font-mono text-white">
                {formatDateTime(hour.time)}
              </div>
              <div className="text-white font-bold">&nbsp;</div>
            </div>
          ))}
        </div>
      )}

      {selectedHour !== null && forecast[selectedHour] && (
        <div className="mt-6 p-4 border rounded bg-gray-800 text-white">
          <h2 className="text-xl font-bold mb-2">
            Details for {formatDetailDateTime(forecast[selectedHour].time)}
          </h2>
          <ul className="space-y-1">
            <li>Temp: {forecast[selectedHour].temperature} °F</li>
            <li>Wind: {forecast[selectedHour].windSpeed} mph from the {forecast[selectedHour].windDirection}</li>
            <li>Precipitation: {forecast[selectedHour].precipChance}%</li>
            <li>Sky Cover: {forecast[selectedHour].skyCover}%</li>
            <li>Tide Height: {forecast[selectedHour].tideHeight ?? 'n/a'} ft</li>
            {forecast[selectedHour].waterTemp !== 'n/a' && forecast[selectedHour].waterTemp !== null && (
              <li>Water Temp: {forecast[selectedHour].waterTemp} °F</li>
            )}
            <li>Daylight: {forecast[selectedHour].isDaylight ? 'Yes' : 'No'}</li>
            <li>Summary: {forecast[selectedHour].summary}</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            Source: <a href="https://www.weather.gov/documentation/services-web-api" className="underline text-blue-300" target="_blank" rel="noopener noreferrer">NOAA Weather API</a> and <a href={`https://tidesandcurrents.noaa.gov/stationhome.html?id=${stationId}`} className="underline text-blue-300" target="_blank" rel="noopener noreferrer">NOAA Tides & Currents for Station {stationId}</a>
            {stationDistance && <> ({parseInt(stationDistance)} miles away)</>}
          </p>
        </div>
      )}
    </div>
  );
}

const formatMinutes = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export default App;
