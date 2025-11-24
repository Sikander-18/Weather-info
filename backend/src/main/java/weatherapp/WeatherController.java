package weatherapp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class WeatherController {

    @Value("${weather.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/weather")
    public String getWeather(@RequestParam String city) {
        String url = String.format(
            "https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric",
            city, apiKey
        );
        
        return restTemplate.getForObject(url, String.class);
    }

    @GetMapping("/forecast")
    public String getForecast(@RequestParam String city) {
        String url = String.format(
            "https://api.openweathermap.org/data/2.5/forecast?q=%s&appid=%s&units=metric",
            city, apiKey
        );
        
        return restTemplate.getForObject(url, String.class);
    }

    @GetMapping("/weather/coordinates")
    public String getWeatherByCoordinates(@RequestParam double lat, @RequestParam double lon) {
        String url = String.format(
            "https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric",
            lat, lon, apiKey
        );
        
        return restTemplate.getForObject(url, String.class);
    }

    @GetMapping("/forecast/coordinates")
    public String getForecastByCoordinates(@RequestParam double lat, @RequestParam double lon) {
        String url = String.format(
            "https://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric",
            lat, lon, apiKey
        );
        
        return restTemplate.getForObject(url, String.class);
    }
}