const weatherCodes = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Cloudy', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '⛈️' },
  71: { label: 'Snow fall', icon: '🌨️' },
  73: { label: 'Snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Severe hail', icon: '⛈️' }
};

const city = 'Delhi';
const apiBase = 'https://geocoding-api.open-meteo.com/v1/search';
const forecastBase = 'https://api.open-meteo.com/v1/forecast';

async function loadWeather() {
  try {
    const geocodeRes = await fetch(`${apiBase}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geocodeData = await geocodeRes.json();
    const location = geocodeData.results?.[0];

    if (!location) throw new Error('Location not found');

    const weatherRes = await fetch(`${forecastBase}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Asia%2FCalcutta`);
    const weather = await weatherRes.json();

    renderWeather(weather, location);
  } catch (error) {
    document.getElementById('condition').textContent = 'Unable to load live data';
    document.getElementById('summary').textContent = 'The forecast service is unavailable right now, so a fallback Delhi view is shown.';
    document.getElementById('temperature').textContent = '32°C';
    document.getElementById('weatherIcon').textContent = '☀️';
    document.getElementById('feelsLike').textContent = '34°C';
    document.getElementById('humidity').textContent = '44%';
    document.getElementById('wind').textContent = '8 km/h';
    document.getElementById('pressure').textContent = '1008 hPa';
    document.getElementById('sunrise').textContent = '05:42';
    document.getElementById('sunset').textContent = '19:07';
  }
}

function renderWeather(weather, location) {
  const current = weather.current;
  const code = weatherCodes[current.weather_code] || { label: 'Weather update', icon: '🌤️' };
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);

  document.getElementById('temperature').textContent = `${temp}°C`;
  document.getElementById('condition').textContent = code.label;
  document.getElementById('weatherIcon').textContent = code.icon;
  document.getElementById('feelsLike').textContent = `${feelsLike}°C`;
  document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
  document.getElementById('wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  document.getElementById('pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
  document.getElementById('summary').textContent = `${location.name} is currently ${code.label.toLowerCase()} with a temperature of ${temp}°C and ${current.relative_humidity_2m}% humidity.`;

  const sunrise = formatTime(weather.daily.sunrise[0]);
  const sunset = formatTime(weather.daily.sunset[0]);
  document.getElementById('sunrise').textContent = sunrise;
  document.getElementById('sunset').textContent = sunset;

  const hourly = document.getElementById('hourlyForecast');
  hourly.innerHTML = '';
  const hours = weather.hourly.time.slice(0, 6);
  const hourTemps = weather.hourly.temperature_2m.slice(0, 6);
  const hourCodes = weather.hourly.weather_code.slice(0, 6);
  hours.forEach((time, index) => {
    const box = document.createElement('div');
    box.className = 'box';
    const hourLabel = new Date(time).toLocaleTimeString([], { hour: 'numeric' });
    const code = weatherCodes[hourCodes[index]] || { label: 'Weather', icon: '🌤️' };
    box.innerHTML = `<div class="time">${hourLabel}</div><div class="value">${Math.round(hourTemps[index])}°C</div><div>${code.icon}</div>`;
    hourly.appendChild(box);
  });

  const daily = document.getElementById('dailyForecast');
  daily.innerHTML = '';
  weather.daily.time.slice(0, 7).forEach((day, index) => {
    const box = document.createElement('div');
    box.className = 'box';
    const dayName = new Date(day).toLocaleDateString([], { weekday: 'short' });
    const code = weatherCodes[weather.daily.weather_code[index]] || { label: 'Weather', icon: '🌤️' };
    box.innerHTML = `<div class="time">${dayName}</div><div style="font-size:1.2rem; margin:6px 0;">${code.icon}</div><div class="value">${Math.round(weather.daily.temperature_2m_max[index])}° / ${Math.round(weather.daily.temperature_2m_min[index])}°</div>`;
    daily.appendChild(box);
  });

  document.getElementById('updatedAt').textContent = `Updated for ${location.name}, ${location.country}`;
  document.getElementById('lastUpdated').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

loadWeather();
