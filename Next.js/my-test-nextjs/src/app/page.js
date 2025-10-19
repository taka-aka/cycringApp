"use client";

// import dynamic from "next/dynamic";
// import { useState } from "react";

// const Map = dynamic(() => import("../components/Map"), { ssr: false });

// export default function Page() {
//   const [city, setCity] = useState("");
//   const [weather, setWeather] = useState("");
//   const [windSpeed, setWindSpeed] = useState("");
//   const [windDeg, setWindDeg] = useState("");
//   const [destination, setDestination] = useState(null);
  
//   // const [wind, setWeather] = useState("");
//   // async function getWeather() {
//   //   const res = await fetch(`/api/weather_city?city=${city}`);
//   //   const data = await res.json();
//   //   setCity(data.weather.name);
//   //   setWeather(data.weather.weather[0].main);
//   // }

  // async function getWeather() {
  //   try {
  //     const res = await fetch(`/api/weather_city?city=${city}`);
  //     const data = await res.json();
  //     console.log(data)
  //     // データ構造を安全にチェック
  //     if (data && data.weather && data.weather.weather && data.weather.weather[0]) {
  //       setCity(data.weather.name ?? "");
  //       setWeather(data.weather.weather[0].main ?? "不明");
  //     } else {
  //       console.error("Unexpected data format:", data);
  //       setWeather("取得できませんでした");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setWeather("エラーが発生しました");
  //   }
  // }

  // function getGeolocation() {
  //   //navigator.geolocationを呼び出すことでGeolocation APIを利用できる    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  //   navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  // }

  // async function successCallback(position){
  //   var latitude = position.coords.latitude;
  //   var longitude = position.coords.longitude;
  //   const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
  //   const data = await res.json();
  //   console.log(data);

  //   setCity(data.weather.name);
  //   setWeather(data.weather.weather[0].description);
  // };

//   function errorCallback(error){
//     alert("位置情報が取得できませんでした");
//     console.log(error);
//   };

//   return (
//     <div className="text-center mt-8">
//       <input
//         type="text"
//         placeholder="Enter city name"
//         className="border p-2 mr-3 mb-5"
//         onChange={(e) => {
//           setCity(e.target.value);
//         }}
//         value={city}
//       />
//       <button className="bg-gray-100 p-2" onClick={getWeather}>
//         Get weather info
//       </button>
//       <button className="bg-gray-200 p-2" onClick={getGeolocation}>
//         現在地の天気を取得
//       </button>
//       <h1>City: {city}</h1>
//       <p>Weather: {weather}</p>
//       <p>Wind: {wind}</p>
//     </div>
//   );
// }

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// LeafletコンポーネントはSSRでエラーになるのでdynamic importする
const Map = dynamic(() => import("./components/map"), { ssr: false });

export default function Page() {
  const [initialCity, setInitialCity] = useState("");
  const [initialWeather, setInitialWeather] = useState("");
  const [initialPosition, setInitialPosition] = useState("");
  const [initialWindSpeed, setInitialWindSpeed] = useState("");
  const [initialWindDeg, setInitialWindDeg] = useState("");

  const [destination, setDestination] = useState("");
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDeg, setWindDeg] = useState("");

  const [message, SetMessage] = useState("");

  useEffect(() => {
    const tokyo = { lat: 35.6812, lng: 139.7671 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log("現在地:", lat, lon);
          setInitialPosition({ lat, lng: lon });
          setDestination({ lat, lng: lon });
        },
        (error) => {
          console.warn("位置情報が取得できませんでした:", error);
          // 現在地が取れなかった場合は東京を初期値に
          setInitialPosition(tokyo);
          setDestination(tokyo);
        }
      );
    } else {
      console.warn("Geolocation APIが使えません。");
      setInitialPosition(tokyo);
      setDestination(tokyo);
    }
  }, []);

  useEffect(() => {
    if (!initialPosition) return;

    async function fetchInitialWeather() {
      try {
        const data = await getWeather(initialPosition);
        setInitialCity(data.weather.name);
        setInitialWeather(data.weather.weather[0].description);
        setInitialWindSpeed(data.weather.wind.speed);
        setInitialWindDeg(data.weather.wind.deg);
      } catch (err) {
        console.error(err);
      }
    }
    fetchInitialWeather();
  }, [initialPosition]);


  async function handleDestinationSelect(pos) {
    setDestination(pos);
    const data = await getWeather(pos);
    setCity(data.weather.name);
    setWeather(data.weather.weather[0].description)
    setWindSpeed(data.weather.wind.speed);
    setWindDeg(data.weather.wind.deg);
    
    //出発地の風向を参考にする
    let headwind = isHeadWind(initialPosition, pos, initialWindDeg)
    SetMessage(headwind ? "向かい風です。" : "追い風です。");
  }

  async function getWeather(pos) {
    try {
      const res = await fetch(`/api/weather?lat=${pos.lat}&lon=${pos.lng}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      setWeather("エラーが発生しました");
    }
  }

  function isHeadWind(fromPos,toPos, windDeg){
    // 緯度経度から進行方向の角度を計算（北=0°）
    const deltaLat = toPos.lat - fromPos.lat;
    const deltaLng = toPos.lng - fromPos.lng;
    let heading = Math.atan2(deltaLat, deltaLng) * (180 / Math.PI);
    if(heading < 0) heading += 360;

    let angleDiff = Math.abs(heading - windDeg);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;
    return angleDiff > 135;
}

  return (
    <div className="text-center mt-8">
      <h1 className="text-xl font-bold mb-4">Cycring Assist</h1>
      <Map initialPosition={initialPosition}
           onDestinationSelect={handleDestinationSelect}
      />

      {destination && (
        <div className="mt-4">
          <h2>現在地の情報</h2>
          <p>都市名: {initialCity}</p>
          <p>天気: {initialWeather}</p>
          <p>風速: {initialWindSpeed} m/s</p>
          <p>風向: {initialWindDeg}°</p>
          <p>----------------</p>
          <h2>目的地の情報</h2>
          <p>都市名: {city}</p>
          <p>天気: {weather}</p>
          <p>風速: {windSpeed} m/s</p>
          <p>風向: {windDeg}°</p>

          <p><br />{message}</p>
        </div>
      )}
    </div>
  );
}
