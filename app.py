import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dateutil.parser import isoparse
from datetime import datetime, timedelta
from timezonefinder import TimezoneFinder
import pytz
import math
import ephem

app = Flask(__name__)
'CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, origins=["https://the-ideal-time-frontend.onrender.com"])

OPENCAGE_API_KEY = os.getenv('OPENCAGE_API_KEY')

def zip_to_latlon(zip_code):
    url = f'https://api.opencagedata.com/geocode/v1/json?q={zip_code}&key={OPENCAGE_API_KEY}&countrycode=us'
    response = requests.get(url)
    data = response.json()
    if data['results']:
        lat = data['results'][0]['geometry']['lat']
        lon = data['results'][0]['geometry']['lng']
        return lat, lon
    return None, None

def haversine(lat1, lon1, lat2, lon2):
    R = 3958.8
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def is_daylight(utc_dt, lat, lon):
    observer = ephem.Observer()
    observer.lat = str(lat)
    observer.lon = str(lon)
    observer.date = ephem.Date(utc_dt)
    sun = ephem.Sun(observer)
    return sun.alt > 0

def find_closest_tide_station(lat, lon):
    url = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=waterlevels'
    response = requests.get(url)
    stations = response.json().get('stations', [])
    closest_station = None
    min_distance = float('inf')

    for station in stations:
        try:
            s_lat = float(station['lat'])
            s_lon = float(station['lng'])
            distance = haversine(lat, lon, s_lat, s_lon)
            if distance < min_distance:
                min_distance = distance
                closest_station = station
        except:
            continue

    return closest_station['id'], closest_station['name'], min_distance

def score_conditions(entry, thresholds, require_daylight):
    factors_met = 0

    if entry['tideHeight'] is not None and thresholds['tideMin'] <= entry['tideHeight'] <= thresholds['tideMax']:
        factors_met += 1
    if entry['temperature'] is not None and thresholds['tempMin'] <= entry['temperature'] <= thresholds['tempMax']:
        factors_met += 1
    if entry['windSpeed'] is not None and thresholds['windMin'] <= entry['windSpeed'] <= thresholds['windMax']:
        factors_met += 1
    if entry['skyCover'] is not None and thresholds['skyMin'] <= entry['skyCover'] <= thresholds['skyMax']:
        factors_met += 1
    if entry['precipChance'] is not None and thresholds['precipMin'] <= entry['precipChance'] <= thresholds['precipMax']:
        factors_met += 1
    if not require_daylight or entry.get('isDaylight'):
        factors_met += 1

    return factors_met

def get_tide_predictions(station_id, lat, lon):
    now = datetime.utcnow()
    start = now.strftime('%Y%m%d')
    end = (now + timedelta(days=7)).strftime('%Y%m%d')
    url = (
        f'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions'
        f'&datum=MLLW&units=english&time_zone=lst_ldt&interval=h&format=json'
        f'&application=wateractivity&station={station_id}&begin_date={start}&end_date={end}'
    )
    response = requests.get(url)
    predictions = response.json().get('predictions', [])

    tf = TimezoneFinder()
    tz_name = tf.timezone_at(lat=lat, lng=lon)
    local_tz = pytz.timezone(tz_name if tz_name else 'UTC')

    tide_by_time = {}
    for p in predictions:
        try:
            naive_ts = isoparse(p['t']).replace(minute=0, second=0, microsecond=0)
            ts = local_tz.localize(naive_ts)
            tide_by_time[ts.isoformat()] = float(p['v'])
        except Exception:
            continue
    return tide_by_time



def get_water_temperature(station_id):
    now = datetime.utcnow()
    start = (now - timedelta(hours=6)).strftime('%Y%m%d %H:%M')
    end = now.strftime('%Y%m%d %H:%M')
    url = (
        f'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature'
        f'&units=english&time_zone=lst_ldt&format=json&application=wateractivity'
        f'&station={station_id}&begin_date={start}&end_date={end}'
    )
    response = requests.get(url)
    data = response.json().get('data', [])
    for item in reversed(data):
        try:
            return float(item.get('v', 0))
        except (TypeError, ValueError):
            continue
    return None

def get_noaa_hourly_forecast(lat, lon, tide_data, water_temp=None, thresholds=None, require_daylight=False):
    headers = {'User-Agent': 'WaterActivityApp (wtlebo@gmail.com)'}

    points_url = f'https://api.weather.gov/points/{lat},{lon}'
    points_response = requests.get(points_url, headers=headers)
    if points_response.status_code != 200:
        return None

    points_data = points_response.json()
    forecast_url = points_data['properties']['forecastHourly']
    grid_data_url = points_data['properties']['forecastGridData']

    forecast_response = requests.get(forecast_url, headers=headers)
    if forecast_response.status_code != 200:
        return None
    raw_periods = forecast_response.json()['properties']['periods']

    grid_response = requests.get(grid_data_url, headers=headers)
    if grid_response.status_code != 200:
        return None
    sky_data = grid_response.json()['properties']['skyCover']['values']

    sky_by_time = {}
    for entry in sky_data:
        timestamp_str = entry['validTime'].split('/')[0]
        timestamp = isoparse(timestamp_str).astimezone(pytz.UTC).replace(minute=0, second=0, microsecond=0)
        sky_by_time[timestamp.isoformat()] = entry['value']

    clean_data = []
    for hour in raw_periods:
        time_str = hour['startTime']
        time_utc = isoparse(time_str).astimezone(pytz.UTC).replace(minute=0, second=0, microsecond=0)
        time_local = isoparse(time_str).isoformat()

        wind_speed_str = hour.get('windSpeed', '0 mph').split()[0]
        try:
            wind_speed = int(wind_speed_str)
        except ValueError:
            wind_speed = 0

        precip = hour.get('probabilityOfPrecipitation', {}).get('value')
        precip_chance = precip if precip is not None else 0
        sky_cover = sky_by_time.get(time_utc.isoformat(), None)
        tide_height = tide_data.get(time_utc.isoformat(), None)

        entry = {
            'time': time_local,
            'temperature': hour['temperature'],
            'windSpeed': wind_speed,
            'windDirection': hour.get('windDirection'),
            'precipChance': precip_chance,
            'summary': hour.get('shortForecast'),
            'skyCover': sky_cover,
            'tideHeight': tide_height,
            'waterTemp': water_temp,
            'isDaylight': is_daylight(time_utc, lat, lon)
        }

        clean_data.append(entry)

    for i, entry in enumerate(clean_data):
        if entry['skyCover'] is None:
            prev = next((clean_data[j]['skyCover'] for j in range(i - 1, -1, -1) if clean_data[j]['skyCover'] is not None), None)
            next_val = next((clean_data[j]['skyCover'] for j in range(i + 1, len(clean_data)) if clean_data[j]['skyCover'] is not None), None)
            entry['skyCover'] = round((prev + next_val) / 2) if prev and next_val else (prev or next_val or 0)

    for entry in clean_data:
        entry['score'] = score_conditions(entry, thresholds, require_daylight)

    return clean_data

@app.route('/conditions')
def get_conditions():
    zip_code = request.args.get('zip')
    activity = request.args.get('activity', 'paddleboarding').lower()

    thresholds = {
        'tideMin': float(request.args.get('tideMin', -2)),
        'tideMax': float(request.args.get('tideMax', 12)),
        'tempMin': float(request.args.get('tempMin', -10)),
        'tempMax': float(request.args.get('tempMax', 110)),
        'windMin': float(request.args.get('windMin', 0)),
        'windMax': float(request.args.get('windMax', 40)),
        'skyMin': float(request.args.get('skyMin', 0)),
        'skyMax': float(request.args.get('skyMax', 100)),
        'precipMin': float(request.args.get('precipMin', 0)),
        'precipMax': float(request.args.get('precipMax', 100)),
    }

    require_daylight = request.args.get('requireDaylight', 'false').lower() == 'true'

    lat, lon = zip_to_latlon(zip_code)
    if lat is None:
        return jsonify({'error': 'Invalid ZIP code'}), 400

    station_id, station_name, distance_miles = find_closest_tide_station(lat, lon)
    tide_data = get_tide_predictions(station_id, lat, lon)
    water_temp = get_water_temperature(station_id)

    forecast_data = get_noaa_hourly_forecast(
        lat, lon, tide_data, water_temp,
        thresholds=thresholds,
        require_daylight=require_daylight
    )

    if forecast_data is None:
        return jsonify({'error': 'Could not fetch NOAA forecast'}), 500

    return jsonify({
        'zip_code': zip_code,
        'latitude': lat,
        'longitude': lon,
        'station_id': station_id,
        'station_name': station_name,
        'station_distance_miles': round(distance_miles, 2),
        'activity': activity,
        'forecast': forecast_data
    })
