import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
import { GearIcon } from '@radix-ui/react-icons';
import { activityDefaults } from './config/activityDefaults';
import { trackPageView, trackEvent } from './utils/ga';
import { getApiBaseUrl } from './config/api';
import './styles/custom.css';



function App() {
  const [zipCode, setZipCode] = useState(() => localStorage.getItem('zipCode') || '');
  const [activity, setActivity] = useState(() => localStorage.getItem('selectedActivity') || 'paddleboarding');
  const [forecast, setForecast] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationDistance, setStationDistance] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [zipError, setZipError] = useState(false);
  const [conditionsError, setConditionsError] = useState(false);
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Track initial page view
  useEffect(() => {
    trackPageView(window.location.pathname);
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
    trackEvent('zip_search', { zip_code: zipCode });
    let newForecast = [];
    setZipError(false);
    setLocationName('');
    if (!zipCode) return;
    setLoading(true);
    
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
        setConditionsError(true);
        setLoading(false);
        return;
      }
      
      // Set location name if we got valid city/state
      if (data.city && data.state) {
        setLocationName(`${data.city}, ${data.state}`);
      } else {
        console.warn('No valid city/state found:', data);
        setConditionsError(true);
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
        setConditionsError(true);
        setLoading(false);
      }
    } catch (error) {
      console.error('Geocoding fetch error:', error);
      setForecast([]);
      setZipError(true);
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
    setTideEnabled(defaults.relevantFactors.tide);
    setTemperatureEnabled(defaults.relevantFactors.temperature);
    setWindSpeedEnabled(defaults.relevantFactors.windSpeed);
    setSkyCoverEnabled(defaults.relevantFactors.skyCover);
    setPrecipChanceEnabled(defaults.relevantFactors.precipChance);
    setDaylightEnabled(defaults.relevantFactors.daylight);
    //localStorage.setItem('daylightRange', JSON.stringify(defaultDaylight)); //delete this?
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
  };

  const handleActivityChange = (e) => {
    const selected = e.target.value;
    trackEvent('activity_changed', { new_activity: selected });
    setActivity(selected);
    localStorage.setItem('selectedActivity', selected);
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
    // Calculate the number of enabled conditions
    const enabledConditions = [
      tideEnabled,
      temperatureEnabled,
      windSpeedEnabled,
      skyCoverEnabled,
      precipChanceEnabled,
      daylightEnabled
    ].filter(enabled => enabled).length;

    // Calculate thresholds based on enabled conditions
    const thresholds = {
      excellent: enabledConditions, // All conditions met
      good: Math.floor(enabledConditions * 0.8), // 80% of conditions met
      fair: Math.floor(enabledConditions * 0.6), // 60% of conditions met
      poor: Math.floor(enabledConditions * 0.4), // 40% of conditions met
      bad: Math.floor(enabledConditions * 0.2) // 20% of conditions met
    };

    if (score >= thresholds.excellent) return 'bg-green-500';
    if (score >= thresholds.good) return 'bg-yellow-400';
    if (score >= thresholds.fair) return 'bg-amber-600';
    if (score >= thresholds.poor) return 'bg-orange-700';
    return 'bg-red-800';
  };

  const scoreForecast = (rawForecast) => {
    return rawForecast.map(entry => {
      let score = 0;
      
      // Tide
      if (entry.tideHeight !== null && tideEnabled) {
        if (tideRange[0] === scoringConfig.tideMin) {
          score += entry.tideHeight <= tideRange[1] ? 1 : 0;
        } else if (tideRange[1] === scoringConfig.tideMax) {
          score += entry.tideHeight >= tideRange[0] ? 1 : 0;
        } else {
          score += entry.tideHeight >= tideRange[0] && entry.tideHeight <= tideRange[1] ? 1 : 0;
        }
      }
      
      // Temperature
      if (entry.temperature !== null && temperatureEnabled) {
        if (temperatureRange[0] === scoringConfig.temperatureMin) {
          score += entry.temperature <= temperatureRange[1] ? 1 : 0;
        } else if (temperatureRange[1] === scoringConfig.temperatureMax) {
          score += entry.temperature >= temperatureRange[0] ? 1 : 0;
        } else {
          score += entry.temperature >= temperatureRange[0] && entry.temperature <= temperatureRange[1] ? 1 : 0;
        }
      }
      
      // Wind Speed
      if (entry.windSpeed !== null && windSpeedEnabled) {
        if (windSpeedRange[0] === scoringConfig.windSpeedMin) {
          score += entry.windSpeed <= windSpeedRange[1] ? 1 : 0;
        } else if (windSpeedRange[1] === scoringConfig.windSpeedMax) {
          score += entry.windSpeed >= windSpeedRange[0] ? 1 : 0;
        } else {
          score += entry.windSpeed >= windSpeedRange[0] && entry.windSpeed <= windSpeedRange[1] ? 1 : 0;
        }
      }
      
      // Sky Cover
      if (entry.skyCover !== null && skyCoverEnabled) {
        if (skyCoverRange[0] === scoringConfig.skyCoverMin) {
          score += entry.skyCover <= skyCoverRange[1] ? 1 : 0;
        } else if (skyCoverRange[1] === scoringConfig.skyCoverMax) {
          score += entry.skyCover >= skyCoverRange[0] ? 1 : 0;
        } else {
          score += entry.skyCover >= skyCoverRange[0] && entry.skyCover <= skyCoverRange[1] ? 1 : 0;
        }
      }
      
      // Precipitation
      if (entry.precipChance !== null && precipChanceEnabled) {
        if (precipChanceRange[0] === scoringConfig.precipChanceMin) {
          score += entry.precipChance <= precipChanceRange[1] ? 1 : 0;
        } else if (precipChanceRange[1] === scoringConfig.precipChanceMax) {
          score += entry.precipChance >= precipChanceRange[0] ? 1 : 0;
        } else {
          score += entry.precipChance >= precipChanceRange[0] && entry.precipChance <= precipChanceRange[1] ? 1 : 0;
        }
      }
      
      // Daylight
      if (daylightEnabled) {
        const entryMinutes = new Date(entry.time).getHours() * 60 + new Date(entry.time).getMinutes();
        score += entryMinutes >= daylightRange[0] && entryMinutes <= daylightRange[1] ? 1 : 0;
      }
      
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

  // Add state for each factor's checkbox
  const [tideEnabled, setTideEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`tideEnabled_${activity}`)) ?? scoringConfig.relevantFactors.tide
  );
  const [temperatureEnabled, setTemperatureEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`temperatureEnabled_${activity}`)) ?? scoringConfig.relevantFactors.temperature
  );
  const [windSpeedEnabled, setWindSpeedEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`windSpeedEnabled_${activity}`)) ?? scoringConfig.relevantFactors.windSpeed
  );
  const [skyCoverEnabled, setSkyCoverEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`skyCoverEnabled_${activity}`)) ?? scoringConfig.relevantFactors.skyCover
  );
  const [precipChanceEnabled, setPrecipChanceEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`precipChanceEnabled_${activity}`)) ?? scoringConfig.relevantFactors.precipChance
  );
  const [daylightEnabled, setDaylightEnabled] = useState(() => 
    JSON.parse(localStorage.getItem(`daylightEnabled_${activity}`)) ?? scoringConfig.relevantFactors.daylight
  );

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
        {enabled && (
          <>
            <div className="flex items-center gap-4">
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
                  const { key, ...restProps } = props;
                  
                  // Only show labels for non-percentage sliders
                  const showLabels = unit !== '%';
                  
                  return (
                    <div key={key} {...restProps} style={{ ...restProps.style, ...trackStyle }}>
                      {showLabels && (
                        <div style={{
                          position: 'absolute',
                          left: '0',
                          top: '-1.5em',
                          fontSize: '0.75em',
                          color: '#ccc'
                        }}>
                          {min}
                        </div>
                      )}
                      {showLabels && (
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: '-1.5em',
                          fontSize: '0.75em',
                          color: '#ccc'
                        }}>
                          {max}
                        </div>
                      )}
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
                values[0] === min ? `no min - ${values[1]} ${unit}` : 
                values[1] === max ? `${values[0]} ${unit} - no max` : 
                `${values[0]} ${unit} - ${values[1]} ${unit}`}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <select
              value={activity}
              onChange={handleActivityChange}
              className="bg-gray-700 text-white px-2 py-1 rounded"
            >
              {Object.entries(activityDefaults).map(([key, { displayName }]) => (
                <option key={key} value={key}>{displayName}</option>
              ))}
            </select>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
            >
              {showSettings ? 'Hide Settings' : 'Settings'}
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter ZIP code"
                className="w-full bg-gray-700 text-white px-2 py-1 rounded focus:outline-none"
              />
            </div>
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
            <div className="text-red-500 text-sm mb-2">
              {zipError ? 'Please enter a valid ZIP code' : 'Could not fetch conditions data'}
            </div>
          )}

          {showSettings && !zipError && (
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
{{ ... }}
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
