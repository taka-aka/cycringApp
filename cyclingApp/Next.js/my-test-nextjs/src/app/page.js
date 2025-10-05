"use client";

import { useState } from "react";

export default function Page() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState("");

  async function getWeather() {
    const res = await fetch(`/api/weather?city=${city}`);
    const data = await res.json();
    setCity(data.weather.name);
    setWeather(data.weather.weather[0].main);
  }

  function getGeolocation() {
    //navigator.geolocationを呼び出すことでGeolocation APIを利用できる    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }

  async function successCallback(position){
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
    const data = await res.json();
    console.log(data);

    setCity(data.weather.name);
    setWeather(data.weather.weather[0].main);
  };

  function errorCallback(error){
    alert("位置情報が取得できませんでした");
    console.log(error);
  };

  return (
    <div className="text-center mt-8">
      {/* <input
        type="text"
        placeholder="Enter city name"
        className="border p-2 mr-3 mb-5"
        onChange={(e) => {
          setCity(e.target.value);
        }}
        value={city}
      />
      <button className="bg-gray-200 p-2" onClick={getWeather}>
        Get weather info
      </button> */}
      <button className="bg-gray-200 p-2" onClick={getGeolocation}>
        現在地の天気を取得
      </button>
      <h1>City: {city}</h1>
      <p>Weather: {weather}</p>
    </div>
  );
}

