import React, { useState, useMemo, useRef, useEffect } from 'react';
import './App.css';

function Card({ title, children, className = "" }) {
  return (
    <div className={`weather-card rounded-2xl p-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function SearchBar({ onSearch, onUseLocation, onFocusRef, isLoading, onSearchComplete }) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => [
    'San Francisco, CA','New York, NY','London, UK','Paris, FR','Tokyo, JP','Sydney, AU','Berlin, DE','Toronto, CA','Mumbai, IN','Dubai, AE'
  ], []);

  // Clear search bar when search is complete
  useEffect(() => {
    if (onSearchComplete) {
      setValue('');
      setOpen(false);
    }
  }, [onSearchComplete]);
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-stretch gap-2">
        <div className="search-container flex items-center glass rounded-xl shadow-md overflow-hidden flex-1 relative">
          <div className="pl-4 text-gray-500 text-xl">🔍</div>
          <input
            className="flex-1 px-4 py-3 outline-none text-gray-800 bg-transparent placeholder-gray-500"
            placeholder="Search for a city..."
            value={value}
            onChange={(e) => { setValue(e.target.value); setOpen(e.target.value.length > 0); }}
            onFocus={() => setOpen(value.length > 0)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) onSearch(value); }}
            ref={onFocusRef}
            disabled={isLoading}
          />
          <button 
            className={`px-4 py-3 text-blue-600 font-medium hover:text-blue-700 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={() => !isLoading && onSearch(value)}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : 'Search'}
          </button>
          {open && (
            <div className="absolute top-full left-0 right-0 glass shadow-lg rounded-b-xl max-h-64 overflow-auto z-10 animate-popIn">
              {suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0,8).map((s) => (
                <button 
                  key={s} 
                  className="w-full text-left px-4 py-2 hover:bg-white/20 transition-colors duration-200" 
                  onMouseDown={() => { setValue(s); onSearch(s); }}
                >
                  {s}
                </button>
              ))}
              {suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
              )}
            </div>
          )}
        </div>
        <button
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 shadow-md md:w-auto w-full"
          onClick={onUseLocation}
          disabled={isLoading}
          aria-label="Use Current Location"
        >
          <span className="text-xl">📍</span>
          <span>Use Current Location</span>
        </button>
      </div>
    </div>
  );
}

// Current location is now integrated into SearchBar on the right side

function WeatherDisplay({ temperature, conditionIcon, conditionText, humidity, windSpeed, tempClass = "" }) {
  return (
    <div className="flex items-center gap-6">
      <div className={`text-6xl transition-all duration-500 ${tempClass}`}>{conditionIcon}</div>
      <div className="temp-display">
        <div className={`text-5xl font-light text-gray-900 transition-all duration-500 ${tempClass}`}>{temperature}</div>
        <div className="text-gray-600 text-lg">{conditionText}</div>
        <div className="mt-3 text-gray-500 flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <span>💧</span>
            <span>{humidity}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>💨</span>
            <span>{windSpeed}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ForecastItem({ day, condition, icon, tempHigh, tempLow }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-gray-700 font-medium w-28">{day}</div>
      <div className="w-24 flex items-center gap-2 text-gray-600">
        <span>{icon}</span>
        <span>{condition}</span>
      </div>
      <div className="text-gray-800 font-semibold">{tempHigh}
        <span className="text-gray-400 font-normal ml-1">{tempLow}</span>
      </div>
    </div>
  );
}

function App() {
  const [city, setCity] = useState('Mumbai, IN');
  const [condition, setCondition] = useState('Sunny');
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // { day, condition, icon, tempHigh, tempLow }
  const [unit, setUnit] = useState('C');
  const searchInputRef = useRef(null);
  const [currentTempC, setCurrentTempC] = useState(22);
  const [humidity, setHumidity] = useState(65);
  const [windKmh, setWindKmh] = useState(19);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [searchComplete, setSearchComplete] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const API_BASE = 'http://localhost:8080';

  const theme = useMemo(() => {
    const map = {
      Sunny: { bg: 'from-yellow-300 to-orange-500', emoji: '☀️', class: 'weather-sunny' },
      Cloudy: { bg: 'from-slate-500 to-gray-700', emoji: '☁️', class: 'weather-cloudy' },
      Rainy: { bg: 'from-blue-900 to-sky-600', emoji: '🌧️', class: 'weather-rainy' },
      Snowy: { bg: 'from-sky-200 to-blue-300', emoji: '❄️', class: 'weather-snowy' },
      Stormy: { bg: 'from-gray-800 to-purple-800', emoji: '⛈️', class: 'weather-stormy' }
    };
    return map[condition] || map['Sunny'];
  }, [condition]);

  // Temperature-based animation classes
  const tempClass = useMemo(() => {
    if (currentTempC >= 30) return 'temp-hot';
    if (currentTempC <= 5) return 'temp-cold';
    return 'temp-moderate';
  }, [currentTempC]);

  // Helper function to get weather condition from API data
  const getWeatherCondition = (weatherMain) => {
    if (/cloud/i.test(weatherMain)) return 'Cloudy';
    if (/rain/i.test(weatherMain)) return 'Rainy';
    if (/snow/i.test(weatherMain)) return 'Snowy';
    if (/storm|thunder/i.test(weatherMain)) return 'Stormy';
    return 'Sunny';
  };

  // Helper function to get weather emoji
  const getWeatherEmoji = (condition) => {
    const map = {
      'Sunny': '☀️',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Snowy': '❄️',
      'Stormy': '⛈️'
    };
    return map[condition] || '☀️';
  };

  // Helper function to process forecast data
  const processForecastData = (forecastList) => {
    const dailyData = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          temps: [],
          conditions: [],
          icons: []
        };
      }
      
      dailyData[date].temps.push(Math.round(item.main.temp));
      const condition = getWeatherCondition(item.weather[0].main);
      dailyData[date].conditions.push(condition);
      dailyData[date].icons.push(getWeatherEmoji(condition));
    });

    // Get next 3 days
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();
    const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toDateString();

    return [
      {
        day: 'Today',
        condition: dailyData[today]?.conditions[0] || 'Sunny',
        icon: dailyData[today]?.icons[0] || '☀️',
        tempHigh: Math.max(...(dailyData[today]?.temps || [22])),
        tempLow: Math.min(...(dailyData[today]?.temps || [22]))
      },
      {
        day: 'Tomorrow',
        condition: dailyData[tomorrow]?.conditions[0] || 'Sunny',
        icon: dailyData[tomorrow]?.icons[0] || '☀️',
        tempHigh: Math.max(...(dailyData[tomorrow]?.temps || [20])),
        tempLow: Math.min(...(dailyData[tomorrow]?.temps || [20]))
      },
      {
        day: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        condition: dailyData[dayAfter]?.conditions[0] || 'Sunny',
        icon: dailyData[dayAfter]?.icons[0] || '☀️',
        tempHigh: Math.max(...(dailyData[dayAfter]?.temps || [18])),
        tempLow: Math.min(...(dailyData[dayAfter]?.temps || [18]))
      }
    ];
  };

  // Helper function to process hourly data
  const processHourlyData = (forecastList) => {
    const now = new Date();
    const next10Hours = forecastList
      .filter(item => {
        const itemTime = new Date(item.dt * 1000);
        return itemTime > now && itemTime <= new Date(now.getTime() + 10 * 60 * 60 * 1000);
      })
      .slice(0, 10)
      .map(item => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        temp: Math.round(item.main.temp),
        condition: getWeatherCondition(item.weather[0].main),
        icon: getWeatherEmoji(getWeatherCondition(item.weather[0].main))
      }));

    return next10Hours;
  };

  const pushToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 2600);
  };

  const handleSearch = async (q) => {
    if (!q || isLoading) return;
    
    setIsLoading(true);
    setSearchComplete(false); // Reset search completion state
    try {
      pushToast(`Fetching weather for ${q}...`);
      
      // Fetch current weather and forecast in parallel
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE}/weather?city=${encodeURIComponent(q)}`),
        fetch(`${API_BASE}/forecast?city=${encodeURIComponent(q)}`)
      ]);
      
      if (!weatherRes.ok) throw new Error('City not found');
      
      const [weatherData, forecastData] = await Promise.all([
        weatherRes.json(),
        forecastRes.json()
      ]);
      
      // Update current weather
      setCity(`${weatherData.name}${weatherData.sys?.country ? ', ' + weatherData.sys.country : ''}`);
      setCurrentTempC(Math.round(weatherData.main?.temp ?? 22));
      setHumidity(Math.round(weatherData.main?.humidity ?? 65));
      const windMs = weatherData.wind?.speed ?? 5.5;
      setWindKmh(Math.round(windMs * 3.6));
      setCondition(getWeatherCondition(weatherData.weather?.[0]?.main || 'Sunny'));
      
      // Update forecast data
      if (forecastData.list) {
        setForecastData(processForecastData(forecastData.list));
        setHourlyData(processHourlyData(forecastData.list));
      }
      
      pushToast('Updated weather ✔', 'success');
      setSearchComplete(true); // Trigger search completion
    } catch (e) {
      pushToast(e.message || 'Failed to fetch weather', 'error');
      // Fallback to Mumbai
      if (q.toLowerCase() !== 'mumbai' && q.toLowerCase() !== 'mumbai, in') {
        try {
          const [weatherRes2, forecastRes2] = await Promise.all([
            fetch(`${API_BASE}/weather?city=${encodeURIComponent('Mumbai, IN')}`),
            fetch(`${API_BASE}/forecast?city=${encodeURIComponent('Mumbai, IN')}`)
          ]);
          
          if (weatherRes2.ok) {
            const [weatherData2, forecastData2] = await Promise.all([
              weatherRes2.json(),
              forecastRes2.json()
            ]);
            
            setCity(`${weatherData2.name}${weatherData2.sys?.country ? ', ' + weatherData2.sys.country : ''}`);
            setCurrentTempC(Math.round(weatherData2.main?.temp ?? 30));
            setHumidity(Math.round(weatherData2.main?.humidity ?? 70));
            const windMs2 = weatherData2.wind?.speed ?? 5.5;
            setWindKmh(Math.round(windMs2 * 3.6));
            setCondition(getWeatherCondition(weatherData2.weather?.[0]?.main || 'Sunny'));
            
            if (forecastData2.list) {
              setForecastData(processForecastData(forecastData2.list));
              setHourlyData(processHourlyData(forecastData2.list));
            }
            
            pushToast('Showing Mumbai by default', 'info');
            setSearchComplete(true);
          }
        } catch {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      pushToast('Geolocation not supported', 'error');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    setSearchComplete(false);
    
    try {
      pushToast('Getting your location...', 'info');
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });
      
      const { latitude, longitude } = position.coords;
      
      pushToast('Fetching weather for your location...', 'info');
      
      // Fetch weather and forecast by coordinates in parallel
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`${API_BASE}/weather/coordinates?lat=${latitude}&lon=${longitude}`),
        fetch(`${API_BASE}/forecast/coordinates?lat=${latitude}&lon=${longitude}`)
      ]);
      
      if (!weatherRes.ok) throw new Error('Failed to fetch location weather');
      
      const [weatherData, forecastData] = await Promise.all([
        weatherRes.json(),
        forecastRes.json()
      ]);
      
      // Update current weather
      setCity(`${weatherData.name}${weatherData.sys?.country ? ', ' + weatherData.sys.country : ''}`);
      setCurrentTempC(Math.round(weatherData.main?.temp ?? 22));
      setHumidity(Math.round(weatherData.main?.humidity ?? 65));
      const windMs = weatherData.wind?.speed ?? 5.5;
      setWindKmh(Math.round(windMs * 3.6));
      setCondition(getWeatherCondition(weatherData.weather?.[0]?.main || 'Sunny'));
      
      // Update forecast data
      if (forecastData.list) {
        setForecastData(processForecastData(forecastData.list));
        setHourlyData(processHourlyData(forecastData.list));
      }
      
      pushToast('Location weather updated ✔', 'success');
      setSearchComplete(true);
    } catch (e) {
      pushToast(e.message || 'Failed to get location weather', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openForecastModal = (item) => setModal(item);
  const closeForecastModal = () => setModal(null);

  // Use real forecast data or fallback to default
  const forecast = forecastData.length > 0 ? forecastData : [
    { day: 'Today', condition: condition, icon: theme.emoji, tempHigh: currentTempC, tempLow: currentTempC - 5 },
    { day: 'Tomorrow', condition: 'Cloudy', icon: '☁️', tempHigh: 20, tempLow: 13 },
    { day: 'Sunday', condition: 'Rainy', icon: '🌧️', tempHigh: 17, tempLow: 11 }
  ];

  // Keyboard shortcut: focus search on '/'
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Load default weather for Mumbai on first mount
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      handleSearch('Mumbai, IN');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized]);

  // Reset search completion state after it's been processed
  useEffect(() => {
    if (searchComplete) {
      const timer = setTimeout(() => {
        setSearchComplete(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchComplete]);

  const displayTemp = (celsiusLabel) => {
    const n = parseInt(celsiusLabel);
    if (unit === 'C') return `${n}°C`;
    const f = Math.round((n * 9) / 5 + 32);
    return `${f}°F`;
  };

  function UnitToggle() {
    return (
      <div className="flex items-center gap-2 text-white/90">
        <span className={`px-2 py-1 rounded-lg cursor-pointer ${unit==='C' ? 'bg-white/20' : 'bg-white/10'}`} onClick={() => setUnit('C')}>°C</span>
        <span className={`px-2 py-1 rounded-lg cursor-pointer ${unit==='F' ? 'bg-white/20' : 'bg-white/10'}`} onClick={() => setUnit('F')}>°F</span>
      </div>
    );
  }

  // Enhanced animated canvas background
  function WeatherCanvas({ condition }) {
    const canvasRef = useRef(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);
      const onResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
      window.addEventListener('resize', onResize);

      const particleCount = condition === 'Snowy' ? 200 : condition === 'Rainy' ? 150 : condition === 'Stormy' ? 100 : 80;
      const particles = Array.from({ length: particleCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: condition === 'Snowy' ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5,
        s: condition === 'Rainy' ? Math.random() * 4 + 2 : Math.random() * 1 + 0.5,
        vx: condition === 'Cloudy' ? (Math.random() - 0.5) * 0.5 : condition === 'Stormy' ? (Math.random() - 0.5) * 1 : 0,
        vy: condition === 'Stormy' ? (Math.random() - 0.5) * 0.5 : 0,
        life: Math.random() * 100,
        maxLife: 100,
      }));

      let raf;
      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        
        // Add gradient background based on condition
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        if (condition === 'Sunny') {
          gradient.addColorStop(0, 'rgba(255, 193, 7, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 87, 34, 0.1)');
        } else if (condition === 'Rainy') {
          gradient.addColorStop(0, 'rgba(33, 150, 243, 0.1)');
          gradient.addColorStop(1, 'rgba(63, 81, 181, 0.1)');
        } else if (condition === 'Snowy') {
          gradient.addColorStop(0, 'rgba(224, 247, 250, 0.1)');
          gradient.addColorStop(1, 'rgba(179, 229, 252, 0.1)');
        } else if (condition === 'Stormy') {
          gradient.addColorStop(0, 'rgba(33, 33, 33, 0.1)');
          gradient.addColorStop(1, 'rgba(66, 66, 66, 0.1)');
        }
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.globalAlpha = 0.8;
        particles.forEach(p => {
          p.life -= 0.5;
          
          if (condition === 'Rainy') {
            ctx.strokeStyle = `rgba(255,255,255,${0.3 + Math.sin(p.life * 0.1) * 0.3})`;
            ctx.lineWidth = 1 + Math.sin(p.life * 0.1) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + 2, p.y + 12);
            ctx.stroke();
            p.y += p.s * 2.5; 
            p.x += 0.8;
            if (p.y > height || p.life <= 0) { 
              p.y = -20; 
              p.x = Math.random() * width; 
              p.life = p.maxLife;
            }
          } else if (condition === 'Snowy') {
            ctx.fillStyle = `rgba(255,255,255,${0.6 + Math.sin(p.life * 0.1) * 0.4})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.s; 
            p.x += p.vx * 0.5;
            if (p.y > height || p.life <= 0) { 
              p.y = -10; 
              p.x = Math.random() * width; 
              p.life = p.maxLife;
            }
          } else if (condition === 'Stormy') {
            ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.sin(p.life * 0.2) * 0.1})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx; 
            p.y += p.vy + Math.sin(p.x * 0.01) * 0.3;
            if (p.x > width) p.x = 0; 
            if (p.x < 0) p.x = width;
            if (p.y > height) p.y = 0;
            if (p.y < 0) p.y = height;
          } else {
            ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(p.life * 0.05) * 0.04})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.vx; 
            p.y += Math.sin(p.x * 0.01) * 0.2;
            if (p.x > width) p.x = 0; 
            if (p.x < 0) p.x = width;
          }
        });
        raf = requestAnimationFrame(draw);
      };
      draw();
      return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
    }, [condition]);
    return <canvas ref={canvasRef} className="fixed inset-0 -z-10 w-full h-full" aria-hidden="true" />;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-0 flex flex-col items-stretch transition-all duration-700 particle-container`}>
      <WeatherCanvas condition={condition} />
      <div className="p-6 md:p-8 relative z-10">
        <h1 className="text-4xl md:text-5xl text-white font-semibold text-center mb-6 animate-fadeInUp drop-shadow-lg">
          WeatherNow
        </h1>

        <div className="w-full animate-fadeInUp" style={{ animationDelay: '.05s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="text-white/80 text-sm hidden md:block flex items-center gap-2">
              <span>💡</span>
              <span>Press / to search</span>
            </div>
            <UnitToggle />
          </div>
          <SearchBar 
            onSearch={handleSearch} 
            onUseLocation={handleUseLocation} 
            onFocusRef={searchInputRef} 
            isLoading={isLoading}
            onSearchComplete={searchComplete}
          />
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-10">
          <div className="animate-fadeInUp" style={{ animationDelay: '.1s', animationFillMode: 'both' }}>
            <Card title="Current Weather" className={theme.class}>
              <div className="flex items-center gap-2 text-gray-600 font-semibold mb-4">
                <span className="text-xl">📍</span>
                <span>{city}</span>
              </div>
              <WeatherDisplay 
                temperature={displayTemp(`${currentTempC}°`)} 
                conditionIcon={theme.emoji} 
                conditionText={condition} 
                humidity={`${humidity}%`} 
                windSpeed={`${windKmh} km/h`}
                tempClass={tempClass}
              />
            </Card>
          </div>
          <div className="lg:col-span-2 animate-fadeInUp" style={{ animationDelay: '.15s', animationFillMode: 'both' }}>
            <Card title="3-Day Forecast" className={theme.class}>
              <div className="divide-y divide-gray-200">
                {forecast.map((f, index) => (
                  <button 
                    key={f.day} 
                    className="w-full text-left hover:bg-gray-50/50 transition-colors duration-200 rounded-lg p-2 -m-2" 
                    onClick={() => openForecastModal(f)}
                  >
                    <ForecastItem 
                      day={f.day} 
                      condition={f.condition} 
                      icon={f.icon} 
                      tempHigh={displayTemp(`${f.tempHigh}°`)} 
                      tempLow={displayTemp(`${f.tempLow}°`)} 
                    />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto mt-6 animate-fadeInUp" style={{ animationDelay: '.2s', animationFillMode: 'both' }}>
          <Card title="Next 10 Hours" className={theme.class}>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {hourlyData.length > 0 ? hourlyData.map((hour, i) => (
                <div key={i} className="min-w-[90px] glass rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xs text-gray-500 mb-1">{hour.time}</div>
                  <div className="text-lg mb-1">{hour.icon}</div>
                  <div className="text-sm text-gray-700 font-medium">{displayTemp(`${hour.temp}°`)}</div>
                </div>
              )) : Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="min-w-[90px] glass rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="text-xs text-gray-500 mb-1">{(i+8)%24}:00</div>
                  <div className="text-lg mb-1">{theme.emoji}</div>
                  <div className="text-sm text-gray-700 font-medium">{displayTemp('18°')}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`toast animate-popIn rounded-xl px-4 py-3 text-sm font-medium text-white ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-emerald-500' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop" onClick={closeForecastModal}></div>
          <div className="relative z-50 bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md animate-popIn">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{modal.day} details</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={closeForecastModal}>✖</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{modal.icon}</div>
              <div>
                <div className="text-xl font-medium text-gray-900">{modal.condition}</div>
                <div className="text-gray-600">High {modal.tempHigh} · Low {modal.tempLow}</div>
              </div>
            </div>
            <div className="mt-4 text-gray-500 text-sm">This is a demo modal. Hook it to real forecast data later.</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
