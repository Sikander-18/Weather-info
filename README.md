# WeatherNow 🌤️

A modern, full-stack weather application with real-time weather data, 3-day forecasts, and hourly predictions. Built with React and Spring Boot.

## ✨ Features

- **Real-time Weather Data** - Get current weather conditions for any city worldwide
- **3-Day Forecast** - View detailed weather predictions for the next 3 days
- **Hourly Forecast** - Check weather conditions for the next 10 hours
- **Geolocation Support** - Automatically detect and display weather for your current location
- **Temperature Units** - Toggle between Celsius and Fahrenheit
- **Smart Search** - City suggestions with autocomplete
- **Animated UI** - Dynamic weather-based animations and particle effects
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- React 19.2.0
- Tailwind CSS
- HTML5 Canvas (for weather animations)
- Geolocation API

### Backend
- Spring Boot 3.1.5
- Java 17
- Maven
- OpenWeatherMap API

## 📋 Prerequisites

- Node.js (v14 or higher)
- Java 17
- Maven
- OpenWeatherMap API Key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Kuch bhi"
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Update the API key in `src/main/resources/application.properties`:

```properties
server.port=8080
weather.api.key=YOUR_API_KEY_HERE
```

Build and run the Spring Boot application:

```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/weatherapp/
│   │       │   ├── WeatherApplication.java
│   │       │   ├── WeatherConfig.java
│   │       │   └── WeatherController.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

## 🔌 API Endpoints

### Get Weather by City
```
GET /weather?city={cityName}
```

### Get Forecast by City
```
GET /forecast?city={cityName}
```

### Get Weather by Coordinates
```
GET /weather/coordinates?lat={latitude}&lon={longitude}
```

### Get Forecast by Coordinates
```
GET /forecast/coordinates?lat={latitude}&lon={longitude}
```

## 🎨 Features in Detail

### Weather Conditions
The app supports multiple weather conditions with unique visual themes:
- ☀️ Sunny
- ☁️ Cloudy
- 🌧️ Rainy
- ❄️ Snowy
- ⛈️ Stormy

### Interactive Elements
- **Search Bar** - Type to search cities with autocomplete suggestions
- **Location Button** - Click to use your current location
- **Temperature Toggle** - Switch between °C and °F
- **Forecast Modal** - Click on any forecast day for detailed information
- **Keyboard Shortcut** - Press `/` to focus the search bar

### Animations
- Dynamic particle effects based on weather conditions
- Smooth transitions between weather states
- Temperature-based visual effects
- Glassmorphism UI elements

## 🔧 Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080
weather.api.key=YOUR_OPENWEATHERMAP_API_KEY
```

### Frontend Configuration

The API base URL is configured in `App.js`:

```javascript
const API_BASE = 'http://localhost:8080';
```

## 📦 Build for Production

### Backend

```bash
cd backend
mvn clean package
java -jar target/weather-backend-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd frontend
npm run build
```

The production build will be in the `frontend/build` directory.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Weather data provided by [OpenWeatherMap API](https://openweathermap.org/api)
- Icons and emojis for weather conditions
- Tailwind CSS for styling utilities

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

Made with ❤️ using React and Spring Boot
