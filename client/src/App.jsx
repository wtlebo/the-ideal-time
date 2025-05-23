import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
import { GearIcon } from '@radix-ui/react-icons';
import { activityDefaults } from './config/activityDefaults';
import { trackPageView, trackEvent } from './utils/ga';
import { getApiBaseUrl } from './config/api';
import './styles/custom.css';
import logo from '/logo.png';



function App() {
  const [zipCode, setZipCode] = useState(() => localStorage.getItem('zipCode') || '');
  const [activity, setActivity] = useState(() => localStorage.getItem('selectedActivity') || 'paddleboarding');


  const [forecast, setForecast] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationDistance, setStationDistance] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [zipError, setZipError] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [conditionsError, setConditionsError] = useState(false);
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track initial page view and check for valid ZIP from localStorage
  useEffect(() => {
    trackPageView(window.location.pathname);
    
    // Check for valid ZIP from localStorage on initial load
    const savedZip = localStorage.getItem('zipCode');
    if (savedZip) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (zipRegex.test(savedZip)) {
        setZipCode(savedZip);
        validateAndFetch();
      }
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      validateAndFetch();
    } else if (e.target.value.length === 5 || e.target.value.length === 10) {
      // Only fetch when Enter is pressed, not on input change
    }
  };

  const handleZipChange = async (e) => {
    setZipError(false);
    setFetchError(false);
    setZipCode(e.target.value);
    // Only fetch when Enter is pressed or Check button is clicked
    // We'll remove the automatic validation on input change
  };

  const validateAndFetch = async () => {
    if (!zipCode) return;
    
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      setZipError(true);
      return;
    }
    
    setZipError(false);
    setLoading(true);
    await fetchConditions();
    setLoading(false);
  };


  const handleRestoreDefaults = () => {
    const defaults = activityDefaults[activity];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    setDaylightRange(defaults.daylightRange);
    setTideEnabled(defaults.relevantFactors.tide);
    setTemperatureEnabled(defaults.relevantFactors.temperature);
    setWindSpeedEnabled(defaults.relevantFactors.windSpeed);
    setSkyCoverEnabled(defaults.relevantFactors.skyCover);
    setPrecipChanceEnabled(defaults.relevantFactors.precipChance);
    setDaylightEnabled(defaults.relevantFactors.daylight);
    // Update scoring with new defaults
    setForecast(prevForecast => scoreForecast(prevForecast));
  };

  const fetchConditions = async () => {
    trackEvent('zip_search', { zip_code: zipCode });
    let newForecast = [];
    setZipError(false);
    setFetchError(false);
    setLocationName('');
    if (!zipCode) return;
    
    try {
      // Default sunrise/sunset fallback
      const sunrise = 360; // 6 AM
      const sunset = 1080; // 6 PM
      
      // Fetch conditions data directly
      const params = new URLSearchParams({
        zip: zipCode,
        activity
      });
      const res = await fetch(`${getApiBaseUrl()}/conditions?${params}`);
      const data = await res.json();
      
      // Check for conditions error
      if (data.error) {
        console.error('Conditions error:', data.error);
        setFetchError(true);
        setLoading(false);
        return;
      }
      
      // Set location name if we got valid city/state
      if (data.city && data.state) {
        setLocationName(`${data.city}, ${data.state}`);
      } else {
        console.warn('No valid city/state found:', data);
        setFetchError(true);
        setLoading(false);
        return;
      }
      // Set station and timezone info
      setStationId(data.station_id || '');
      setStationName(data.station_name || '');
      setStationDistance(data.station_distance_miles || null);
      setTimeZone(data.timezone || 'America/New_York');
      
      // Process forecast data
      newForecast = data.forecast || [];
      if (newForecast.length > 0) {
        setForecast(scoreForecast(newForecast));
        setLoading(false);
      } else {
        setForecast([]);
        setFetchError(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Geocoding fetch error:', error);
      setForecast([]);
      setFetchError(true);
      setLoading(false);
    }
  };

  const handleActivityChange = (e) => {
    const selected = e.target.value;
    trackEvent('activity_changed', { new_activity: selected });
    
    // Reset all ranges to activity defaults
    const defaults = activityDefaults[selected];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    setDaylightRange(defaults.daylightRange);

    // Reset all checkbox states to activity defaults
    setTideEnabled(defaults.relevantFactors.tide);
    setTemperatureEnabled(defaults.relevantFactors.temperature);
    setWindSpeedEnabled(defaults.relevantFactors.windSpeed);
    setSkyCoverEnabled(defaults.relevantFactors.skyCover);
    setPrecipChanceEnabled(defaults.relevantFactors.precipChance);
    setDaylightEnabled(defaults.relevantFactors.daylight);

    // Update activity and save to localStorage
    setActivity(selected);
    localStorage.setItem('selectedActivity', selected);
    // Update scoring with new activity defaults
    setForecast(prevForecast => scoreForecast(prevForecast));
  };

  const getScoreColor = (score) => {
    if (score >= 6) return 'bg-green-500';
    if (score === 5) return 'bg-yellow-400';
    if (score === 4) return 'bg-amber-600';
    if (score === 3) return 'bg-orange-700';
    if (score === 2) return 'bg-red-800';
    if (score === 1) return 'bg-red-800';
    return 'bg-red-800';
  };

  // Score forecast data using current settings
  const scoreForecast = (rawForecast) => {
    return rawForecast.map(entry => {
      let score = 0;
      
      // Tide
      if (entry.tideHeight !== null) {
        score += tideEnabled ? (
          tideRange[0] === scoringConfig.tideMin ? entry.tideHeight <= tideRange[1] : 
          tideRange[1] === scoringConfig.tideMax ? entry.tideHeight >= tideRange[0] : 
          entry.tideHeight >= tideRange[0] && entry.tideHeight <= tideRange[1]
        ) ? 1 : 0 : 1;
      }
      
      // Temperature
      if (entry.temperature !== null) {
        score += temperatureEnabled ? (
          temperatureRange[0] === scoringConfig.temperatureMin ? entry.temperature <= temperatureRange[1] : 
          temperatureRange[1] === scoringConfig.temperatureMax ? entry.temperature >= temperatureRange[0] : 
          entry.temperature >= temperatureRange[0] && entry.temperature <= temperatureRange[1]
        ) ? 1 : 0 : 1;
      }
      
      // Wind Speed
      if (entry.windSpeed !== null) {
        score += windSpeedEnabled ? (
          windSpeedRange[0] === scoringConfig.windSpeedMin ? entry.windSpeed <= windSpeedRange[1] : 
          windSpeedRange[1] === scoringConfig.windSpeedMax ? entry.windSpeed >= windSpeedRange[0] : 
          entry.windSpeed >= windSpeedRange[0] && entry.windSpeed <= windSpeedRange[1]
        ) ? 1 : 0 : 1;
      }
      
      // Sky Cover
      if (entry.skyCover !== null) {
        score += skyCoverEnabled ? (
          skyCoverRange[0] === scoringConfig.skyCoverMin ? entry.skyCover <= skyCoverRange[1] : 
          skyCoverRange[1] === scoringConfig.skyCoverMax ? entry.skyCover >= skyCoverRange[0] : 
          entry.skyCover >= skyCoverRange[0] && entry.skyCover <= skyCoverRange[1]
        ) ? 1 : 0 : 1;
      }
      
      // Precipitation
      if (entry.precipChance !== null) {
        score += precipChanceEnabled ? (
          precipChanceRange[0] === scoringConfig.precipChanceMin ? entry.precipChance <= precipChanceRange[1] : 
          precipChanceRange[1] === scoringConfig.precipChanceMax ? entry.precipChance >= precipChanceRange[0] : 
          entry.precipChance >= precipChanceRange[0] && entry.precipChance <= precipChanceRange[1]
        ) ? 1 : 0 : 1;
      }
      
      // Calculate entry minutes for daylight check
      const entryMinutes = new Date(entry.time).getHours() * 60 + new Date(entry.time).getMinutes();
      
      // Daylight
      score += daylightEnabled ? (
        entryMinutes >= daylightRange[0] && entryMinutes <= daylightRange[1]
      ) ? 1 : 0 : 1;
      
      return { ...entry, score };
    });
  };

  // Update forecast scores when data is fetched
  useEffect(() => {
    if (forecast.length > 0) {
      setForecast(prevForecast => scoreForecast(prevForecast));
    }
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



  // Add state for each factor's checkbox
  const [tideEnabled, setTideEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`tideEnabled_${activity}`)) ?? activityDefaults[activity].relevantFactors.tide
  );
  const [temperatureEnabled, setTemperatureEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`temperatureEnabled_${activity}`)) ?? activityDefaults[activity].relevantFactors.temperature
  );
  const [windSpeedEnabled, setWindSpeedEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`windSpeedEnabled_${activity}`)) ?? activityDefaults[activity].relevantFactors.windSpeed
  );
  const [skyCoverEnabled, setSkyCoverEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`skyCoverEnabled_${activity}`)) ?? activityDefaults[activity].relevantFactors.skyCover
  );
  const [precipChanceEnabled, setPrecipChanceEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`precipChanceEnabled_${activity}`)) ?? activityDefaults[activity].relevantFactors.precipChance
  );
  const [daylightEnabled, setDaylightEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`daylightEnabled_${activity}`)) ?? activityDefaults[activity].relevantFactors.daylight
  );

  useEffect(() => {
    // Save enabled states to localStorage when activity changes
    localStorage.setItem(`tideEnabled_${activity}`, JSON.stringify(tideEnabled));
    localStorage.setItem(`temperatureEnabled_${activity}`, JSON.stringify(temperatureEnabled));
    localStorage.setItem(`windSpeedEnabled_${activity}`, JSON.stringify(windSpeedEnabled));
    localStorage.setItem(`skyCoverEnabled_${activity}`, JSON.stringify(skyCoverEnabled));
    localStorage.setItem(`precipChanceEnabled_${activity}`, JSON.stringify(precipChanceEnabled));
    localStorage.setItem(`daylightEnabled_${activity}`, JSON.stringify(daylightEnabled));
  }, [activity, tideEnabled, temperatureEnabled, windSpeedEnabled, skyCoverEnabled, precipChanceEnabled, daylightEnabled]);

  const renderSlider = (label, min, max, step, values, setValues, unit, enabled, setEnabled) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-white">{label}</label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-4">
          <Range
            values={values}
            step={step}
            min={min}
            max={max}
            onChange={(values) => {
              // Ensure values are within min/max range and properly rounded
              const normalizedValues = values.map(value => {
                const rounded = Math.round((value - min) / step) * step + min;
                return Math.max(min, Math.min(max, rounded));
              });
              setValues(normalizedValues);
              if (unit === 'min') {
                localStorage.setItem(`daylightRange_${activity}`, JSON.stringify(normalizedValues));
              } else {
                localStorage.setItem(`${label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${activity}`, JSON.stringify(normalizedValues));
              }
            }}
            renderTrack={({ props, children }) => {
              const trackStyle = {
                height: '6px',
                width: '100%',
                display: 'flex'
              };

              // Extract key from props if it exists
              const { key, ...restProps } = props;

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
                <div key={key} {...restProps} style={{ ...restProps.style, ...trackStyle }}>
                  {backgroundStyles.map((style, idx) => (
                    <div key={idx} style={style} />
                  ))}
                  {children}
                </div>
              );
            }}
            renderThumb={({ props }) => {
              const { key, ...restProps } = props;
              return (
                <div
                  key={key}
                  {...restProps}
                  className="h-4 w-4 bg-white border border-gray-400 rounded-full shadow"
                />
              );
            }}
          />
        </div>
        <div className="text-sm mt-1 text-gray-300">
          Selected: {unit === 'min' ? `${formatMinutes(values[0])} - ${formatMinutes(values[1])}` : 
            unit === '%' ? `${values[0]}% - ${values[1]}%` : 
            values[0] === min && values[1] === max ? `no min - no max` : 
            values[0] === min ? `no min - ${values[1]} ${unit}` : 
            values[1] === max ? `${values[0]} ${unit} - no max` : 
            `${values[0]} ${unit} - ${values[1]} ${unit}`}
        </div>
      </div>
    );
  };

  const handleApplySettings = () => {
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
    // Only update scoring, don't fetch new data
    setForecast(prevForecast => scoreForecast(prevForecast));
  };

  return (
    <div className="px-4 pb-4 max-w-md mx-auto">
      <div>
        <div className="flex justify-center mb-4 w-full max-w-md mx-auto">
          <img src={logo} alt="The Ideal Time Logo" className="h-12" />
        </div>


        <div className="flex gap-2 items-center mb-1 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="ZIP"
            className="border rounded px-2 py-1 w-28 h-[32px]"
            value={zipCode}
            onChange={handleZipChange}
            onKeyDown={handleKeyDown}
            name="postal-code"
            autoComplete="postal-code"
          />
          <select
            className="border rounded px-2 py-1 h-[32px] w-48"
            value={activity}
            onChange={handleActivityChange}
          >
            {Object.entries(activityDefaults).map(([key, config]) => (
              <option key={key} value={key}>
                {config.displayName}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-blue-600 text-white px-3 py-1 rounded h-[32px] flex items-center justify-center"
            title="Preferences"
          >
            <GearIcon className="w-4 h-4" />
          </button>
          <button
            onClick={validateAndFetch}
            className="bg-blue-600 text-white px-3 py-1 rounded h-[32px] flex items-center justify-center"
            title="Check Conditions"
          >
            <span className="text-lg">✓</span>
          </button>
        </div>

        {locationName && (
          <div className="text-sm text-center text-gray-300 mb-2">{locationName}</div>
        )}
        {zipError && (
          <div className="text-red-500 text-sm mb-2">
            <strong>Error:</strong> Please enter a valid ZIP code (e.g., 12345 or 12345-6789)
          </div>
        )}
        {fetchError && (
          <div className="text-red-500 text-sm mb-2">
            <strong>Error:</strong> Could not fetch conditions data
          </div>
        )}

        {showSettings && (
          <div className="mb-6 border rounded p-4 bg-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">
              Ideal conditions for {activityDefaults[activity].displayName}
            </h2>
            {renderSlider('Time of Day', scoringConfig.daylightMin, scoringConfig.daylightMax, 15, daylightRange, setDaylightRange, 'min', daylightEnabled, setDaylightEnabled)}
            {renderSlider('Temperature (°F)', scoringConfig.temperatureMin, scoringConfig.temperatureMax, 1, temperatureRange, setTemperatureRange, '°F', temperatureEnabled, setTemperatureEnabled)}
            {renderSlider('Wind Speed (mph)', scoringConfig.windSpeedMin, scoringConfig.windSpeedMax, 1, windSpeedRange, setWindSpeedRange, 'mph', windSpeedEnabled, setWindSpeedEnabled)}
            {renderSlider('Sky Cover (%)', scoringConfig.skyCoverMin, scoringConfig.skyCoverMax, 1, skyCoverRange, setSkyCoverRange, '%', skyCoverEnabled, setSkyCoverEnabled)}
            {renderSlider('Precipitation Chance (%)', scoringConfig.precipChanceMin, scoringConfig.precipChanceMax, 1, precipChanceRange, setPrecipChanceRange, '%', precipChanceEnabled, setPrecipChanceEnabled)}
            {renderSlider('Tide (ft)', scoringConfig.tideMin, scoringConfig.tideMax, 0.1, tideRange, setTideRange, 'ft', tideEnabled, setTideEnabled)}
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
          <div className="h-[375px] overflow-y-auto space-y-1">
            {loading && <p>Loading...</p>}
            {forecast.map((hour, idx) => (
              <div
                key={idx}
                className={`hourly-scoring-block ${getScoreColor(hour.score)} ${selectedHour === idx ? 'selected' : ''}`}
                onClick={() => setSelectedHour(selectedHour === idx ? null : idx)}
              >
                <div className="time">
                  {formatDateTime(hour.time)}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedHour !== null && forecast[selectedHour] && (
          <div className="mt-6 p-4 border rounded bg-gray-800 text-white scoring-block">
            <h2 className="text-xl font-bold mb-2">
              Details for {formatDetailDateTime(forecast[selectedHour].time)}
            </h2>
            <ul className="space-y-1">
              <li className="font-bold">Temp: {forecast[selectedHour].temperature} °F</li>
              <li className="font-bold">Wind: {forecast[selectedHour].windSpeed} mph from the {forecast[selectedHour].windDirection}</li>
              <li className="font-bold">Precipitation: {forecast[selectedHour].precipChance}%</li>
              <li className="font-bold">Sky Cover: {forecast[selectedHour].skyCover}%</li>
              <li className="font-bold">Tide Height: {forecast[selectedHour].tideHeight ?? 'n/a'} ft</li>
              {forecast[selectedHour].waterTemp !== 'n/a' && forecast[selectedHour].waterTemp !== null && (
                <li className="font-bold">Water Temp: {forecast[selectedHour].waterTemp} °F</li>
              )}
              <li className="font-bold">Daylight: {forecast[selectedHour].isDaylight ? 'Yes' : 'No'}</li>
              <li className="font-bold">Summary: {forecast[selectedHour].summary}</li>
            </ul>
            <p className="mt-4 text-sm text-gray-400">
              Source: <a href="https://www.weather.gov/documentation/services-web-api" className="underline text-blue-300" target="_blank" rel="noopener noreferrer">NOAA Weather API</a> and <a href={`https://tidesandcurrents.noaa.gov/stationhome.html?id=${stationId}`} className="underline text-blue-300" target="_blank" rel="noopener noreferrer">NOAA Tides & Currents for Station {stationId}</a>
              {stationDistance && <> ({parseInt(stationDistance)} miles away)</>}
            </p>
          </div>
        )}
      </div>
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
