import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
import { GearIcon } from '@radix-ui/react-icons';
import { activityDefaults } from './config/activityDefaults';

function App() {
  const [zipCode, setZipCode] = useState(() => localStorage.getItem('zipCode') || '');
  const [activity, setActivity] = useState('paddleboarding');
  const [forecast, setForecast] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationDistance, setStationDistance] = useState(null);
  const [timeZone, setTimeZone] = useState('America/New_York');
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const scoringConfig = activityDefaults[activity];

  const [tideRange, setTideRange] = useState(scoringConfig.tideRange);
  const [temperatureRange, setTemperatureRange] = useState(scoringConfig.temperatureRange);
  const [windSpeedRange, setWindSpeedRange] = useState(scoringConfig.windSpeedRange);
  const [skyCoverRange, setSkyCoverRange] = useState(scoringConfig.skyCoverRange);
  const [precipChanceRange, setPrecipChanceRange] = useState(scoringConfig.precipChanceRange);
  const [daylightRange, setDaylightRange] = useState(() => {
    const stored = localStorage.getItem('daylightRange');
    return stored ? JSON.parse(stored) : [360, 1080];
  }); // 6:00 AM to 6:00 PM

  useEffect(() => {
    if (/^\d{5}$/.test(zipCode)) {
      fetchConditions();
    }
  }, [zipCode]);


  const fetchConditions = async () => {
    let newForecast = [];
    if (!zipCode) return;
    setLoading(true);
    // Default sunrise/sunset fallback
    const sunrise = 360; // 6 AM
    const sunset = 1080; // 6 PM
    try {
      const sunResponse = await fetch(`https://api.sunrise-sunset.org/json?lat=42.36&lng=-71.06&formatted=0`);
      const sunData = await sunResponse.json();
      const sunriseDate = new Date(sunData.results.sunrise);
      const sunsetDate = new Date(sunData.results.sunset);
      const minutesFromMidnight = d => d.getUTCHours() * 60 + d.getUTCMinutes();
      const newRange = [minutesFromMidnight(sunriseDate), minutesFromMidnight(sunsetDate)].sort((a, b) => a - b);
      setDaylightRange($1.map(v => Math.round(v / 15) * 15));
      localStorage.setItem('daylightRange', JSON.stringify(newRange));
    } catch (e) {
      console.warn('Could not fetch sunrise/sunset:', e);
      const fallbackRange = [sunrise, sunset];
      setDaylightRange(fallbackRange);
      localStorage.setItem('daylightRange', JSON.stringify(fallbackRange));
    }
    setSelectedHour(null);
    localStorage.setItem('zipCode', zipCode);
    try {
      const params = new URLSearchParams({
        zip: zipCode,
        activity
      });
      const response = await fetch(`https://the-ideal-time.onrender.com/conditions?${params.toString()}`);
      const data = await response.json();
      console.log('Forecast data:', data.forecast);
      newForecast = data.forecast || [];
      setStationId(data.station_id || '');
      setStationName(data.station_name || '');
      setStationDistance(data.station_distance_miles || null);
      setTimeZone(data.timezone || 'America/New_York');
      setForecast(scoreForecast(newForecast));
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
    const defaultDaylight = [360, 1080];
    setDaylightRange(defaultDaylight);
    localStorage.setItem('daylightRange', JSON.stringify(defaultDaylight));
  };

  const handleApplySettings = () => {
    setShowSettings(false);
  };

  const handleActivityChange = (e) => {
    const selected = e.target.value;
    setActivity(selected);
    const defaults = activityDefaults[selected];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    const storedDaylight = localStorage.getItem(`daylightRange_${selected}`);
    if (storedDaylight) {
      setDaylightRange(JSON.parse(storedDaylight));
    }
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
          onChange={setValues}
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
          onChange={(values) => {
            setValues(values);
            if (unit === 'min') {
              localStorage.setItem(`daylightRange_${activity}`, JSON.stringify(values));
            }
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
          <div className="animate-spin rounded-full h-6 w-6 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      )}

      <div className="flex gap-2 items-center mb-4">
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


      {showSettings && (
        <div className="mb-6 border rounded p-4" style={{ backgroundColor: 'rgb(106, 90, 205)' }}>
          <h2 className="text-lg font-semibold text-white mb-4">
            Ideal conditions for {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </h2>
          {renderSlider('Tide (ft)', scoringConfig.tideMin, scoringConfig.tideMax, 0.1, tideRange, setTideRange, 'ft')}
          {renderSlider('Temperature (°F)', scoringConfig.temperatureMin, scoringConfig.temperatureMax, 1, temperatureRange, setTemperatureRange, '°F')}
          {renderSlider('Wind Speed (mph)', scoringConfig.windSpeedMin, scoringConfig.windSpeedMax, 1, windSpeedRange, setWindSpeedRange, 'mph')}
          {renderSlider('Sky Cover (%)', scoringConfig.skyCoverMin, scoringConfig.skyCoverMax, 1, skyCoverRange, setSkyCoverRange, '%')}
          {renderSlider('Precipitation Chance (%)', scoringConfig.precipChanceMin, scoringConfig.precipChanceMax, 1, precipChanceRange, setPrecipChanceRange, '%')}
          {renderSlider('Daylight Hours', 0, 1439, 15, daylightRange, setDaylightRange, 'min')}
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

      {!showSettings && (
        <div className="h-[500px] overflow-y-auto space-y-2">
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
