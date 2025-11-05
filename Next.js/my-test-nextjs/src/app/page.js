"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button, Card, CardContent, Typography, Box, Toolbar, Container, AppBar, Grid } from "@mui/material";

// Leafletマップ（SSR無効）
// const Map = dynamic(() => import("./components/map"), { ssr: false });
const Map = dynamic(() => import("./components/map-route"), { ssr: false });

// 🌈 天気に応じた背景色を返す関数
function getWeatherColor(weather) {
  if (!weather) return "#ffffff";
  const lower = weather.toLowerCase();
  if (lower.includes("clear") || lower.includes("晴")) return "#FFE0B2"; // 晴れ
  if (lower.includes("rain") || lower.includes("雨")) return "#BBDEFB"; // 雨
  if (lower.includes("cloud") || lower.includes("曇")) return "#E0E0E0"; // 曇り
  if (lower.includes("snow") || lower.includes("雪")) return "#E1F5FE"; // 雪
  return "#FFFFFF";
}

export default function Page() {
  const [initialCity, setInitialCity] = useState("");
  const [initialWeather, setInitialWeather] = useState("");
  const [initialPosition, setInitialPosition] = useState(null);
  const [initialWindSpeed, setInitialWindSpeed] = useState("");
  const [initialWindDeg, setInitialWindDeg] = useState("");

  const [destination, setDestination] = useState(null);
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDeg, setWindDeg] = useState("");
  const [message, SetMessage] = useState("");

  useEffect(() => {
    const tokyo = { lat: 35.6812, lng: 139.7671 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setInitialPosition({ lat, lng: lon });
          setDestination({ lat, lng: lon });
        },
        () => {
          setInitialPosition(tokyo);
          setDestination(tokyo);
        }
      );
    } else {
      setInitialPosition(tokyo);
      setDestination(tokyo);
    }
  }, []);

  useEffect(() => {
    if (!initialPosition) return;
    async function fetchInitialWeather() {
      const data = await getWeather(initialPosition);
      setInitialCity(data.weather.name);
      setInitialWeather(data.weather.weather[0].description);
      setInitialWindSpeed(data.weather.wind.speed);
      setInitialWindDeg(data.weather.wind.deg);
    }
    fetchInitialWeather();
  }, [initialPosition]);

  async function getWeather(pos) {
    const res = await fetch(`/api/weather?lat=${pos.lat}&lon=${pos.lng}`);
    return await res.json();
  }

  async function handleDestinationSelect(pos) {
    setDestination(pos);
    const data = await getWeather(pos);
    setCity(data.weather.name);
    setWeather(data.weather.weather[0].description);
    setWindSpeed(data.weather.wind.speed);
    setWindDeg(data.weather.wind.deg);

    const headwind = isHeadWind(initialPosition, pos, initialWindDeg);
    SetMessage(headwind ? "🌬️ 向かい風です。" : "🚴‍♀️ 追い風です！");
  }

  function isHeadWind(fromPos, toPos, windDeg) {
    const deltaLat = toPos.lat - fromPos.lat;
    const deltaLng = toPos.lng - fromPos.lng;
    let heading = Math.atan2(deltaLat, deltaLng) * (180 / Math.PI);
    if (heading < 0) heading += 360;
    let angleDiff = Math.abs(heading - windDeg);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    return angleDiff > 135;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h4">Cycling App</Typography>
        </Toolbar>
      </AppBar>


      
      {destination && (
        <>
          <Container sx={{ height: "500px", mt: 3, mb: 2 }}> 
            <Map initialPosition={initialPosition} onDestinationSelect={handleDestinationSelect} />
          </Container>

          <Box sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                }}>
            
            <Card
              sx={{ 
                backgroundColor: getWeatherColor(weather),
                transition: "background-color 0.5s ease",
              }}
            >
              <CardContent>
                <Typography variant="h6">📍 目的地</Typography>
                <Typography>都市名: {city}</Typography>
                <Typography>天気: {weather}</Typography>
                <Typography>風速: {windSpeed} m/s</Typography>
                <Typography>風向: {windDeg}°</Typography>
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      <Grid
        sx={{ display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 2,
            }}>
        <Typography
          sx={{ marginTop: 2,
                fontWeight: "bold",
                fontSize: "1.1rem",
                justifyContent: "center",
                mb: 2,
              }}>
          {message}
        </Typography>
      
        <Button
          width="auto"
          variant="contained"
          color="primary"
          onClick={() => location.reload()}>
          更新
        </Button>
      </Grid>
    </>
  );

}
