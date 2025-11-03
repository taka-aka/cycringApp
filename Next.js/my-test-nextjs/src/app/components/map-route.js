"use client";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

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

// 🚗 経路描画用コンポーネント
function RoutingMachine({ start, end }) {
  const map = useMap();

  useEffect(() => {
    if (!start || !end) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
      router: L.Routing.mapbox(process.env.NEXT_PUBLIC_MAPBOX_TOKEN),
      lineOptions: {
        styles: [{ color: "#007bff", weight: 5 }],
      },
      addWaypoints: false, // 地図上で経由地を追加できなくする
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null, // ルート上に余計なマーカーを出さない
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [start, end, map]);

  return null;
}
/////////////

export default function Map({ initialPosition, onDestinationSelect }) {
  // const [position, setPosition] = useState(initialPosition);
  const [destination, setDestination] = useState(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setDestination({ lat, lng });
        onDestinationSelect({ lat, lng }); // 親に座標渡す
      },
    });
    // return position ? <Marker position={position} icon={pinIcon}></Marker> : null;
    return destination ? <Marker position={[destination.lat, destination.lng]} icon={pinIcon} /> : null;
  }

  if (!initialPosition.lat || !initialPosition.lng) {
    return <p>地図を読み込み中...</p>;
  }
  return (
    <MapContainer center={[initialPosition.lat, initialPosition.lng]} zoom={13} >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={[initialPosition.lat, initialPosition.lng]} icon={initialPinIcon}></Marker>
      <LocationMarker />
      {destination && (
        <RoutingMachine start={initialPosition} end={destination} />
      )}
    </MapContainer>
  );
}
