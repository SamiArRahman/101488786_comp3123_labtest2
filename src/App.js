import { useEffect, useMemo, useState } from "react";
import "./App.css";

function SearchBar({ city, setCity, onSearch, loading }) {
  return (
    <form className="search" onSubmit={onSearch}>
      <input
        className="searchInput"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Search city (e.g., Toronto)"
        aria-label="City"
      />
      <button className="searchBtn" type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function WeatherCard({ data }) {
  const w = data.weather?.[0];
  const iconUrl = w?.icon
    ? `https://openweathermap.org/img/wn/${w.icon}@2x.png`
    : null;

  return (
    <div className="card">
      <div className="cardTop">
        <div>
          <div className="location">
            {data.name}, {data.sys?.country}
          </div>
          <div className="desc">{w?.main} — {w?.description}</div>
        </div>

        {iconUrl && (
          <img className="icon" src={iconUrl} alt={w?.description || "weather"} />
        )}
      </div>

      <div className="tempRow">
        <div className="temp">
          {Math.round(data.main?.temp)}°C
        </div>
        <div className="feels">
          Feels like {Math.round(data.main?.feels_like)}°C
        </div>
      </div>

      <div className="grid">
        <Stat label="Min / Max" value={`${Math.round(data.main?.temp_min)}° / ${Math.round(data.main?.temp_max)}°`} />
        <Stat label="Humidity" value={`${data.main?.humidity}%`} />
        <Stat label="Pressure" value={`${data.main?.pressure} hPa`} />
        <Stat label="Wind" value={`${data.wind?.speed} m/s`} />
        <Stat label="Clouds" value={`${data.clouds?.all}%`} />
        <Stat label="Visibility" value={`${(data.visibility ?? 0) / 1000} km`} />
      </div>
    </div>
  );
}

export default function App() {
  const [city, setCity] = useState("Toronto");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const key = useMemo(() => process.env.REACT_APP_OWM_KEY, []);

  async function fetchWeather(cityName) {
    if (!key) throw new Error("Missing API key. Put it in .env as REACT_APP_OWM_KEY");
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${encodeURIComponent(cityName)}` +
      `&appid=${encodeURIComponent(key)}` +
      `&units=metric`;

    const res = await fetch(url);
    const json = await res.json();

    if (!res.ok || String(json.cod) !== "200") {
      throw new Error(json.message || "Failed to fetch weather");
    }
    return json;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const json = await fetchWeather("Toronto");
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []); 

  async function onSearch(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const json = await fetchWeather(city.trim());
      setData(json); 
    } catch (e2) {
      setError(e2.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1 className="title">Weather Now</h1>
          <p className="subtitle">Search any city and see current conditions.</p>
        </div>
      </header>

      <SearchBar city={city} setCity={setCity} onSearch={onSearch} loading={loading} />

      {error && <div className="error">❌ {error}</div>}
      {!error && !data && !loading && <div className="hint">Search a city to begin.</div>}
      {loading && <div className="hint">Loading current weather…</div>}
      {data && <WeatherCard data={data} />}
    </div>
  );
}
