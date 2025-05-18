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
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const scoringConfig = activityDefaults[activity];

  const [tideRange, setTideRange] = useState(scoringConfig.tideRange);
  const [temperatureRange, setTemperatureRange] = useState(scoringConfig.temperatureRange);
  const [windSpeedRange, setWindSpeedRange] = useState(scoringConfig.windSpeedRange);
  const [skyCoverRange, setSkyCoverRange] = useState(scoringConfig.skyCoverRange);
  const [precipChanceRange, setPrecipChanceRange] = useState(scoringConfig.precipChanceRange);
  const [requireDaylight, setRequireDaylight] = useState(scoringConfig.requireDaylight);

  useEffect(() => {
    if (zipCode) {
      fetchConditions();
    }
  }, [zipCode, activity, tideRange, temperatureRange, windSpeedRange, skyCoverRange, precipChanceRange, requireDaylight]);

  const fetchConditions = async () => {
    if (!zipCode) return;
    setLoading(true);
    setSelectedHour(null);
    localStorage.setItem('zipCode', zipCode);
    try {
      const params = new URLSearchParams({
        zip: zipCode,
        activity,
        tideMin: tideRange[0],
        tideMax: tideRange[1],
        tempMin: temperatureRange[0],
        tempMax: temperatureRange[1],
        windMin: windSpeedRange[0],
        windMax: windSpeedRange[1],
        skyMin: skyCoverRange[0],
        skyMax: skyCoverRange[1],
        precipMin: precipChanceRange[0],
        precipMax: precipChanceRange[1],
        requireDaylight
      });
      const response = await fetch(`https://the-ideal-time.onrender.com/conditions?${params.toString()}`);
      const data = await response.json();
      console.log('Forecast data:', data.forecast);
      setForecast(data.forecast || []);
      setStationId(data.station_id || '');
      setStationName(data.station_name || '');
      setStationDistance(data.station_distance_miles || null);
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
    setRequireDaylight(defaults.requireDaylight);
  };

  const handleApplySettings = () => {
    setShowSettings(false);
    fetchConditions();
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
    setRequireDaylight(defaults.requireDaylight);
    fetchConditions();
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
        <span className="text-sm w-10 text-gray-100">{min}</span>
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
          renderThumb={({ props }) => (
            <div
              {...props}
              className="h-4 w-4 bg-white border border-gray-400 rounded-full shadow"
            />
          )}
        />
        <span className="text-sm w-10 text-gray-100">{max}</span>
      </div>
      <div className="text-sm mt-1 text-gray-300">
        Selected: {values[0] === min ? 'No minimum' : `${values[0]} ${unit}`} - {values[1] === max ? 'No maximum' : `${values[1]} ${unit}`}
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
          <div className="mt-4">
            <label className="inline-flex items-center text-sm text-white">
              <input
                type="checkbox"
                checked={requireDaylight}
                onChange={(e) => setRequireDaylight(e.target.checked)}
                className="mr-2"
              />
              Require daylight
            </label>
          </div>
          <div className="mt-4 flex justify-between">
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

export default App;
