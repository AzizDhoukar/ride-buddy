import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion } from "framer-motion";

interface LocationPoint {
  longitude: number;
  latitude: number;
  label?: string;
}

interface MapViewProps {
  className?: string;
  pickupLocation?: LocationPoint;
  driverLocation?: LocationPoint;
  customerLocation?: LocationPoint;
  showRoute?: boolean;
  rideStatus?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export default function MapView({
  className = "",
  pickupLocation,
  driverLocation,
  customerLocation,
  rideStatus = "PENDING",
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const driverMarker = useRef<maplibregl.Marker | null>(null);
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const customerMarker = useRef<maplibregl.Marker | null>(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.on("move", () => {
        if (map.current) {
          setLng(map.current.getCenter().lng);
          setLat(map.current.getCenter().lat);
          setZoom(map.current.getZoom());
        }
      });

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation([longitude, latitude]);
            map.current?.flyTo({ center: [longitude, latitude], zoom: 14 });
          },
          (error) => {
            console.error("Error getting user location:", error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current && userLocation) {
      if (userMarker.current) {
        userMarker.current.setLngLat(userLocation);
      } else {
        userMarker.current = new maplibregl.Marker({ color: "#FF0000" })
          .setLngLat(userLocation)
          .addTo(map.current);
      }
    }
  }, [userLocation]);

  useEffect(() => {
    if (map.current && driverLocation) {
      if (driverMarker.current) {
        driverMarker.current.setLngLat([driverLocation.longitude, driverLocation.latitude]);
      } else {
        driverMarker.current = new maplibregl.Marker({ color: "#0000FF" }) // Blue for driver
          .setLngLat([driverLocation.longitude, driverLocation.latitude])
          .addTo(map.current);
      }
    }
  }, [driverLocation]);

  useEffect(() => {
    console.log('pickupLocation', pickupLocation);
    if (map.current && pickupLocation) {
      if (pickupMarker.current) {
        pickupMarker.current.setLngLat([pickupLocation.longitude, pickupLocation.latitude]);
      } else {
        pickupMarker.current = new maplibregl.Marker({ color: "#00FF00" }) // Green for pickup
          .setLngLat([pickupLocation.longitude, pickupLocation.latitude])
          .addTo(map.current);
      }
    }
  }, [pickupLocation]);

  useEffect(() => {
    if (map.current && customerLocation && customerLocation.latitude && customerLocation.longitude) {
      if (customerMarker.current) {
        customerMarker.current.setLngLat([customerLocation.longitude, customerLocation.latitude]);
      } else {
        customerMarker.current = new maplibregl.Marker({ color: "#FFA500" }) // Orange for customer
          .setLngLat([customerLocation.longitude, customerLocation.latitude])
          .addTo(map.current);
      }
    }
  }, [customerLocation]);


  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />

      {/* ETA overlay when driver is en route */}
      {rideStatus === "IN_PROGRESS" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-semibold">
            <span className="text-primary">4 min</span> away
          </p>
        </motion.div>
      )}

      {/* Map attribution - MapLibre will add its own attribution */}
      <div className="absolute bottom-2 right-2 rounded bg-card/60 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
        OpenStreetMap via MapLibre GL JS
      </div>
    </div>
  );
}
