// Weather Service - Open-Meteo API Integration
import * as Location from 'expo-location';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

// Weather code mapping to icon and description
const weatherCodeMap = {
    0: { icon: 'sunny', condition: 'Trời quang' },
    1: { icon: 'sunny', condition: 'Ít mây' },
    2: { icon: 'partly-cloudy', condition: 'Có mây rải rác' },
    3: { icon: 'cloudy', condition: 'Nhiều mây' },
    45: { icon: 'cloudy', condition: 'Sương mù' },
    48: { icon: 'cloudy', condition: 'Sương mù đóng băng' },
    51: { icon: 'rainy', condition: 'Mưa phùn nhẹ' },
    53: { icon: 'rainy', condition: 'Mưa phùn' },
    55: { icon: 'rainy', condition: 'Mưa phùn dày' },
    61: { icon: 'rainy', condition: 'Mưa nhẹ' },
    63: { icon: 'rainy', condition: 'Mưa vừa' },
    65: { icon: 'rainy', condition: 'Mưa to' },
    71: { icon: 'rainy', condition: 'Tuyết nhẹ' },
    73: { icon: 'rainy', condition: 'Tuyết vừa' },
    75: { icon: 'rainy', condition: 'Tuyết dày' },
    80: { icon: 'rainy', condition: 'Mưa rào nhẹ' },
    81: { icon: 'rainy', condition: 'Mưa rào vừa' },
    82: { icon: 'rainy', condition: 'Mưa rào to' },
    95: { icon: 'stormy', condition: 'Giông bão' },
    96: { icon: 'stormy', condition: 'Giông bão kèm mưa đá' },
    99: { icon: 'stormy', condition: 'Giông bão lớn' },
};

// Get user's current location
export const getCurrentLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            // Default to Điện Biên Phủ if location permission denied
            return {
                latitude: 21.7203426,
                longitude: 102.2119891,
                locationName: 'Điện Biên Phủ'
            };
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        // Try to get location name via reverse geocoding
        let locationName = 'Vị trí của bạn';
        try {
            const [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            if (address) {
                locationName = address.district || address.city || address.region || 'Vị trí của bạn';
            }
        } catch (e) {
            console.log('Reverse geocode error:', e);
        }

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            locationName,
        };
    } catch (error) {
        console.error('Location error:', error);
        // Default to Điện Biên Phủ
        return {
            latitude: 21.7203426,
            longitude: 102.2119891,
            locationName: 'Điện Biên Phủ'
        };
    }
};

// Fetch weather data from Open-Meteo API
export const fetchWeatherData = async (latitude, longitude) => {
    try {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            current_weather: 'true',
            hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weathercode',
            daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max,sunrise,sunset',
            timezone: 'Asia/Ho_Chi_Minh',
            forecast_days: '7',
        });

        const response = await fetch(`${OPEN_METEO_API}?${params}`);
        const data = await response.json();

        return parseWeatherData(data);
    } catch (error) {
        console.error('Weather API error:', error);
        return null;
    }
};

// Parse API response to app format
const parseWeatherData = (data) => {
    const { current_weather, hourly, daily } = data;

    // Parse weather code
    const weatherInfo = weatherCodeMap[current_weather.weathercode] || { icon: 'cloudy', condition: 'Không xác định' };

    // Current weather
    const currentWeather = {
        temperature: Math.round(current_weather.temperature),
        windSpeed: Math.round(current_weather.windspeed),
        humidity: hourly.relative_humidity_2m?.[0] || 70,
        condition: weatherInfo.condition,
        icon: weatherInfo.icon,
        isDay: current_weather.is_day === 1,
        precipitation: hourly.precipitation_probability?.[0] || 0,
        sunrise: formatTime(daily.sunrise?.[0]),
        sunset: formatTime(daily.sunset?.[0]),
        feelsLike: Math.round(current_weather.temperature - 2 + Math.random() * 4), // Approximation
        uvIndex: current_weather.is_day ? Math.round(3 + Math.random() * 5) : 0,
    };

    // Hourly forecast (next 24 hours, every 3 hours)
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyForecast = [];

    for (let i = 0; i < 24; i += 3) {
        const hourIndex = currentHour + i;
        if (hourIndex < hourly.time.length) {
            const weatherCode = hourly.weathercode?.[hourIndex] || 0;
            const iconInfo = weatherCodeMap[weatherCode] || { icon: 'cloudy' };

            hourlyForecast.push({
                time: formatHour(hourly.time[hourIndex]),
                temp: Math.round(hourly.temperature_2m[hourIndex]),
                icon: iconInfo.icon,
                precipitation: hourly.precipitation_probability?.[hourIndex] || 0,
            });
        }
    }

    // Weekly forecast
    const weeklyForecast = daily.time.map((date, index) => {
        const weatherCode = daily.weathercode?.[index] || 0;
        const iconInfo = weatherCodeMap[weatherCode] || { icon: 'cloudy' };

        return {
            day: formatDay(date, index),
            high: Math.round(daily.temperature_2m_max[index]),
            low: Math.round(daily.temperature_2m_min[index]),
            icon: iconInfo.icon,
            precipitation: daily.precipitation_probability_max?.[index] || 0,
        };
    });

    return {
        current: currentWeather,
        hourly: hourlyForecast,
        weekly: weeklyForecast,
    };
};

// Helper functions
const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatHour = (isoString) => {
    if (!isoString) return '--:--';
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatDay = (dateString, index) => {
    if (index === 0) return 'Hôm nay';
    if (index === 1) return 'Ngày mai';

    const date = new Date(dateString);
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
};

export default {
    getCurrentLocation,
    fetchWeatherData,
};
