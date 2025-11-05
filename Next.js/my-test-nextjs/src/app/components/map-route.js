// "use client";
// import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
// import { useState, useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "leaflet-routing-machine";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// const initialPinIcon = L.icon({
//   iconUrl:
//     "img/start_pin.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
//   iconSize: [30, 41],
//   iconAnchor: [12, 41],
//   shadowSize: [45, 41],
// });

// const pinIcon = L.icon({
//   iconUrl:
//     "img/goal_pin.png",
//   shadowUrl:
//     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
//   iconSize: [30, 41],
//   iconAnchor: [12, 41],
//   shadowSize: [45, 41],
// });

// // 🚗 経路描画用コンポーネント
// function RoutingMachine({ start, end }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!start || !end) return;

//     const routingControl = L.Routing.control({
//       waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
//       router: L.Routing.mapbox(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
//       lineOptions: {
//         styles: [{ color: "#007bff", weight: 5 }],
//       },
//       addWaypoints: false, // 地図上で経由地を追加できなくする
//       draggableWaypoints: false,
//       fitSelectedRoutes: true,
//       showAlternatives: false,
//       createMarker: () => null, // ルート上に余計なマーカーを出さない
//     }).addTo(map);

//     // routingControl.getRouter().options.profile = 'mapbox/driving';
//     // routingControl.getRouter().options.language = 'ja';

//     return () => map.removeControl(routingControl);
//   }, [start, end, map]);

//   return null;
// }

// /////////////

// export default function Map({ initialPosition, onDestinationSelect }) {
//   // const [position, setPosition] = useState(initialPosition);
//   const [destination, setDestination] = useState(null);

//   function LocationMarker() {
//     useMapEvents({
//       click(e) {
//         const { lat, lng } = e.latlng;
//         setDestination({ lat, lng });
//         onDestinationSelect({ lat, lng }); // 親に座標渡す
//       },
//     });
//     // return position ? <Marker position={position} icon={pinIcon}></Marker> : null;
//     return destination ? <Marker position={[destination.lat, destination.lng]} icon={pinIcon} /> : null;
//   }

//   if (!initialPosition.lat || !initialPosition.lng) {
//     return <p>地図を読み込み中...</p>;
//   }
//   return (
//     <MapContainer center={[initialPosition.lat, initialPosition.lng]} zoom={13} >
//       <TileLayer
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         attribution="&copy; OpenStreetMap contributors"
//       />
//       <Marker position={[initialPosition.lat, initialPosition.lng]} icon={initialPinIcon}></Marker>
//       <LocationMarker />
//       {destination && (
//         <RoutingMachine start={initialPosition} end={destination} />
//       )}
//     </MapContainer>
//   );
// }

"use client";
import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

import "@/app/globals.css";


export default function MapRoute({ initialPosition, onDestinationSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const directionsRef = useRef(null);

  useEffect(() => {
    if (!initialPosition) return;

    // アクセストークン設定
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Map生成（1度だけ）
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialPosition.lng, initialPosition.lat],
        zoom: 12,
      });

      // ナビゲーションコントロール（ズームボタンなど）
      mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

      // Directions（ルート検索）
      directionsRef.current = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/cycling", // 🚴‍♂️ 自転車ルート
      });
      mapRef.current.addControl(directionsRef.current, "top-left");

      // 出発地を現在地に設定
      directionsRef.current.setOrigin([initialPosition.lng, initialPosition.lat]);

      // 目的地を選んだら親に通知
      directionsRef.current.on("route", (e) => {
        const route = e.route[0];
        const destination = directionsRef.current.getDestination();
        if (destination && destination.geometry && onDestinationSelect) {
          const [lng, lat] = destination.geometry.coordinates;
          onDestinationSelect({ lat, lng });
        }
      });
    } else {
      // 現在地が更新された場合は中心を移動
      mapRef.current.setCenter([initialPosition.lng, initialPosition.lat]);
      directionsRef.current.setOrigin([initialPosition.lng, initialPosition.lat]);
    }

    // クリーンアップ（アンマウント時）
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialPosition]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
      }}
    />
  );
}
