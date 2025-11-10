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