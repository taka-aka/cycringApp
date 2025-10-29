// "use client";

// import { useEffect } from "react";
// 
// 

// export default function Map({ onDestinationSelect }) {
//   useEffect(() => {
//     // 地図の初期化
//     const map = L.map("map").setView([35.6895, 139.6917], 10); // 東京を中心に

//     // OpenStreetMap タイルを追加
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution: "© OpenStreetMap contributors",
//     }).addTo(map);

//     return () => {
//       map.remove(); // コンポーネント削除時にクリーンアップ
//     };
//   }, []);

//   return (
//     <div id="map" style={{ height: "400px", width: "100%" }}></div>
//   );
// }

"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const initialPinIcon = L.icon({
  iconUrl:
    "img/start_pin.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [30, 41],
  iconAnchor: [12, 41],
  shadowSize: [45, 41],
});

const pinIcon = L.icon({
  iconUrl:
    "img/goal_pin.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
  iconSize: [30, 41],
  iconAnchor: [12, 41],
  shadowSize: [45, 41],
});

export default function Map({ initialPosition, onDestinationSelect }) {
  const [position, setPosition] = useState(initialPosition);


  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        // 座標を親に渡す
        onDestinationSelect({ lat, lng });
      },
    });
    return position ? <Marker position={position} icon={pinIcon}></Marker> : null;
  }

  if (!initialPosition.lat || !initialPosition.lng) {
    return <p>地図を読み込み中...</p>;
  }
  return (
    <MapContainer center={[initialPosition.lat, initialPosition.lng]} zoom={13} style={{
                                                                                  height: "600px"
                                                                                }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[initialPosition.lat, initialPosition.lng]} icon={initialPinIcon}></Marker>
      <LocationMarker />
    </MapContainer>
  );
}
