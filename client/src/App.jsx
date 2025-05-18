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
  });

  useEffect(() => {
    if (zipCode) {
      fetchConditions();
    }
  }, [zipCode]);

  const fetchConditions = async () => {
    if (!zipCode) return;
    setLoading(true);
    const sunrise = 360;
    const sunset = 1080;
    try {
      const sunResponse = await fetch(`https://api.sunrise-sunset.org/json?lat=42.36&lng=-71.06&formatted=0`);
      const sunData = await sunResponse.json();
      const sunriseDate = new Date(sunData.results.sunrise);
      const sunsetDate = new Date(sunData.results.sunset);
      const minutesFromMidnight = d => d.getUTCHours() * 60 + d.getUTCMinutes();
      const newRange = [minutesFromMidnight(sunriseDate), minutesFromMidnight(sunsetDate)].sort((a, b) => a - b);
      setDaylightRange(newRange);
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
      const params = new URLSearchParams({ zip: zipCode, activity });
      const response = await fetch(`https://the-ideal-time.onrender.com/conditions?${params.toString()}`);
      const data = await response.json();
      setForecast(data.forecast || []);
      setStationId(data.station_id || '');
      setStationName(data.station_name || '');
      setStationDistance(data.station_distance_miles || null);
      setTimeZone(data.timezone || 'America/New_York');
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
    setForecast(prev => scoreForecast(prev));
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

  const formatMinutes = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="p-4">
      <div className="text-xs text-gray-400 text-center mb-2">
        Timezone: {timeZone.replace('_', ' ')}
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter ZIP code"
          className="px-2 py-1 border rounded text-black"
        />
        <select value={activity} onChange={handleActivityChange} className="ml-2 px-2 py-1 rounded text-black">
          {Object.keys(activityDefaults).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
        <button onClick={() => setShowSettings(!showSettings)} className="ml-2 p-1 rounded bg-blue-500 hover:bg-blue-600">
          <GearIcon className="text-white" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-4 bg-gray-800 rounded">
          <div className="text-white font-bold mb-2">Activity Settings</div>
          {renderSlider('Tide Height (ft)', -2, 15, 1, tideRange, setTideRange, 'ft')}
          {renderSlider('Temperature (°F)', 0, 120, 1, temperatureRange, setTemperatureRange, '°F')}
          {renderSlider('Wind Speed (mph)', 0, 40, 1, windSpeedRange, setWindSpeedRange, 'mph')}
          {renderSlider('Sky Cover (%)', 0, 100, 1, skyCoverRange, setSkyCoverRange, '%')}
          {renderSlider('Precipitation Chance (%)', 0, 100, 1, precipChanceRange, setPrecipChanceRange, '%')}
          {renderSlider('Daylight Hours', 0, 1439, 15, daylightRange, (val) => {
            setDaylightRange(val);
            localStorage.setItem(`daylightRange_${activity}`, JSON.stringify(val));
          }, 'min')}

          <div className="mt-4 flex justify-between items-center gap-2">
            <button
              onClick={handleRestoreDefaults}
              className="text-sm bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded"
            >
              Restore Defaults
            </button>
            <button
              onClick={handleApplySettings}
              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {forecast.map((entry, idx) => (
          <div
            key={idx}
            className={`rounded p-2 text-white ${getScoreColor(entry.score)}`}
            onClick={() => setSelectedHour(entry)}
          >
            {formatDateTime(entry.time, timeZone)} — Score: {entry.score}
          </div>
        ))}
      </div>

      {selectedHour && (
        <div className="mt-4 p-4 border rounded bg-white text-black">
          <div className="font-bold mb-1">Details</div>
          <div>{formatDetailDateTime(selectedHour.time, timeZone)}</div>
          <div>Temperature: {selectedHour.temperature}°F</div>
          <div>Wind: {selectedHour.windSpeed} mph ({selectedHour.windDirection})</div>
          <div>Sky Cover: {selectedHour.skyCover}%</div>
          <div>Precipitation: {selectedHour.precipChance}%</div>
          <div>Tide Height: {selectedHour.tideHeight != null ? `${selectedHour.tideHeight} ft` : 'n/a'}</div>
          <div>Water Temp: {selectedHour.waterTemp != null ? `${selectedHour.waterTemp}°F` : 'n/a'}</div>
        </div>
      )}
    </div>
  );
}

export default App;
