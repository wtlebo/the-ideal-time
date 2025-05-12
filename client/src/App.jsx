import React, { useState, useEffect } from 'react';
import { Range, getTrackBackground } from 'react-range';
import { GearIcon } from '@radix-ui/react-icons';
import { activityDefaults } from './config/activityDefaults';

function App() {
  const [zipCode, setZipCode] = useState('');
  const [activity, setActivity] = useState('paddleboarding');
  const [forecast, setForecast] = useState([]);
  const [stationId, setStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [stationDistance, setStationDistance] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const scoringConfig = activityDefaults[activity];

  const [tideRange, setTideRange] = useState(() => JSON.parse(localStorage.getItem(`${activity}_tideRange`)) || scoringConfig.tideRange);
  const [temperatureRange, setTemperatureRange] = useState(() => JSON.parse(localStorage.getItem(`${activity}_temperatureRange`)) || scoringConfig.temperatureRange);
  const [windSpeedRange, setWindSpeedRange] = useState(() => JSON.parse(localStorage.getItem(`${activity}_windSpeedRange`)) || scoringConfig.windSpeedRange);
  const [skyCoverRange, setSkyCoverRange] = useState(() => JSON.parse(localStorage.getItem(`${activity}_skyCoverRange`)) || scoringConfig.skyCoverRange);
  const [precipChanceRange, setPrecipChanceRange] = useState(() => JSON.parse(localStorage.getItem(`${activity}_precipChanceRange`)) || scoringConfig.precipChanceRange);
  const [requireDaylight, setRequireDaylight] = useState(() => JSON.parse(localStorage.getItem(`${activity}_requireDaylight`)) ?? scoringConfig.requireDaylight);

  const saveToLocalStorage = () => {
    localStorage.setItem(`${activity}_tideRange`, JSON.stringify(tideRange));
    localStorage.setItem(`${activity}_temperatureRange`, JSON.stringify(temperatureRange));
    localStorage.setItem(`${activity}_windSpeedRange`, JSON.stringify(windSpeedRange));
    localStorage.setItem(`${activity}_skyCoverRange`, JSON.stringify(skyCoverRange));
    localStorage.setItem(`${activity}_precipChanceRange`, JSON.stringify(precipChanceRange));
    localStorage.setItem(`${activity}_requireDaylight`, JSON.stringify(requireDaylight));
  };

  const handleRestoreDefaults = () => {
    const defaults = activityDefaults[activity];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    setRequireDaylight(defaults.requireDaylight);

    localStorage.removeItem(`${activity}_tideRange`);
    localStorage.removeItem(`${activity}_temperatureRange`);
    localStorage.removeItem(`${activity}_windSpeedRange`);
    localStorage.removeItem(`${activity}_skyCoverRange`);
    localStorage.removeItem(`${activity}_precipChanceRange`);
    localStorage.removeItem(`${activity}_requireDaylight`);
  };

  useEffect(() => {
    fetchConditions();
    saveToLocalStorage();
  }, [tideRange, temperatureRange, windSpeedRange, skyCoverRange, precipChanceRange, requireDaylight]);

  useEffect(() => {
    const defaults = activityDefaults[activity];
    setTideRange(defaults.tideRange);
    setTemperatureRange(defaults.temperatureRange);
    setWindSpeedRange(defaults.windSpeedRange);
    setSkyCoverRange(defaults.skyCoverRange);
    setPrecipChanceRange(defaults.precipChanceRange);
    setRequireDaylight(defaults.requireDaylight);
  }, [activity]);

  const fetchConditions = async () => {
    if (!zipCode) return;
    setLoading(true);
    setSelectedHour(null);
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
      const response = await fetch(`http://localhost:5000/conditions?${params.toString()}`);
      const data = await response.json();
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

  const getScoreColor = (score) => {
    if (score >= 6) return 'bg-green-500';
    if (score === 5) return 'bg-yellow-400';
    if (score === 4) return 'bg-orange-400';
    return 'bg-red-500';
  };

  const formatDateTime = (isoString) => {
    const options = { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return new Date(isoString).toLocaleString(undefined, options);
  };

  const formatDetailDateTime = (isoString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return new Date(isoString).toLocaleString(undefined, options);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchConditions();
    }
  };

  const handleActivityChange = (e) => {
    const selected = e.target.value;
    setActivity(selected);
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
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-center flex-grow">Water Activity Forecast</h1>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-600 hover:text-black ml-2"
          title="Scoring Preferences"
        >
          <GearIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2 items-center mb-4">
        <input
          type="text"
          placeholder="Enter ZIP code"
          className="border rounded px-2 py-1 flex-grow"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <select
          className="border rounded px-2 py-1"
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
          onClick={fetchConditions}
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          Check Conditions
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
          <div className="mt-4 text-right">
            <button
              onClick={handleRestoreDefaults}
              className="text-sm bg-gray-300 hover:bg-gray-400 text-black px-2 py-1 rounded"
            >
              Restore Defaults
            </button>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}

      <div className="h-[500px] overflow-y-auto space-y-2">
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
