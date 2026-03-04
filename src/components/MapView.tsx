import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface LocationPoint {
  x: number;
  y: number;
  label?: string;
}

interface MapViewProps {
  className?: string;
  pickupLocation?: LocationPoint;
  dropoffLocation?: LocationPoint;
  driverLocation?: LocationPoint;
  customerLocation?: LocationPoint;
  showRoute?: boolean;
  rideStatus?: "idle" | "searching" | "accepted" | "arriving" | "in-progress" | "completed";
}

export default function MapView({
  className = "",
  pickupLocation,
  dropoffLocation,
  driverLocation,
  customerLocation,
  showRoute = false,
  rideStatus = "idle",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [animatedDriver, setAnimatedDriver] = useState(driverLocation);

  // Simulate real-time driver movement
  useEffect(() => {
    if (!driverLocation) return;
    setAnimatedDriver(driverLocation);
  }, [driverLocation]);

  // Animate driver position along route when in active states
  useEffect(() => {
    if (rideStatus !== "arriving" && rideStatus !== "in-progress") return;

    const start = rideStatus === "arriving"
      ? { x: 320, y: 120 }
      : { x: 180, y: 200 };
    const end = rideStatus === "arriving"
      ? { x: 180, y: 200 }
      : { x: 80, y: 300 };

    let frame = 0;
    const totalFrames = 120;
    const interval = setInterval(() => {
      frame++;
      const t = frame / totalFrames;
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setAnimatedDriver({
        x: start.x + (end.x - start.x) * eased,
        y: start.y + (end.y - start.y) * eased,
      });
      if (frame >= totalFrames) {
        frame = 0;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [rideStatus]);

  const defaultPickup = pickupLocation || { x: 180, y: 200 };
  const defaultDropoff = dropoffLocation || { x: 80, y: 300 };
  const defaultCustomer = customerLocation || { x: 180, y: 200 };

  return (
    <div ref={mapRef} className={`relative bg-muted ${className}`}>
      {/* Stylized map background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="h-full w-full" viewBox="0 0 400 400">
          {/* Grid lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <line x1={i * 20} y1={0} x2={i * 20} y2={400} stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5} className="text-muted-foreground/20" />
              <line x1={0} y1={i * 20} x2={400} y2={i * 20} stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5} className="text-muted-foreground/20" />
            </g>
          ))}

          {/* Roads */}
          <path d="M0,200 Q100,180 200,200 T400,200" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted-foreground/30" />
          <path d="M200,0 Q180,100 200,200 T200,400" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted-foreground/30" />
          <path d="M50,50 Q150,150 350,100" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/20" />
          <path d="M100,350 Q200,250 350,300" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/20" />
          <path d="M0,100 Q200,80 400,120" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/15" />
          <path d="M300,0 Q280,200 320,400" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/15" />

          {/* Route line when active */}
          {showRoute && (
            <>
              <path
                d={`M${defaultPickup.x},${defaultPickup.y} Q${(defaultPickup.x + defaultDropoff.x) / 2 + 40},${(defaultPickup.y + defaultDropoff.y) / 2 - 30} ${defaultDropoff.x},${defaultDropoff.y}`}
                fill="none"
                stroke="hsl(152, 68%, 45%)"
                strokeWidth="4"
                strokeDasharray="8 4"
                opacity={0.6}
              />
              {/* Route highlight glow */}
              <path
                d={`M${defaultPickup.x},${defaultPickup.y} Q${(defaultPickup.x + defaultDropoff.x) / 2 + 40},${(defaultPickup.y + defaultDropoff.y) / 2 - 30} ${defaultDropoff.x},${defaultDropoff.y}`}
                fill="none"
                stroke="hsl(152, 68%, 45%)"
                strokeWidth="10"
                opacity={0.1}
              />
            </>
          )}

          {/* Pickup marker */}
          {(showRoute || rideStatus !== "idle") && (
            <g>
              <circle cx={defaultPickup.x} cy={defaultPickup.y} r="16" fill="hsl(152, 68%, 45%)" opacity={0.15} />
              <circle cx={defaultPickup.x} cy={defaultPickup.y} r="8" fill="hsl(152, 68%, 45%)" />
              <circle cx={defaultPickup.x} cy={defaultPickup.y} r="4" fill="white" />
            </g>
          )}

          {/* Dropoff marker */}
          {showRoute && (
            <g>
              <circle cx={defaultDropoff.x} cy={defaultDropoff.y} r="16" fill="hsl(38, 92%, 55%)" opacity={0.15} />
              <circle cx={defaultDropoff.x} cy={defaultDropoff.y} r="8" fill="hsl(38, 92%, 55%)" />
              <circle cx={defaultDropoff.x} cy={defaultDropoff.y} r="4" fill="white" />
            </g>
          )}

          {/* Nearby driver markers (shown when idle or searching) */}
          {(rideStatus === "idle" || rideStatus === "searching") && (
            <>
              {[
                { x: 250, y: 150 }, { x: 140, y: 280 }, { x: 310, y: 230 },
                { x: 90, y: 160 }, { x: 280, y: 320 },
              ].map((pos, i) => (
                <g key={`nearby-${i}`}>
                  <circle cx={pos.x} cy={pos.y} r="6" fill="hsl(210, 100%, 55%)" opacity={0.3}>
                    <animate attributeName="r" values="6;10;6" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={pos.x} cy={pos.y} r="4" fill="hsl(210, 100%, 55%)" />
                  {/* Car icon simplified */}
                  <rect x={pos.x - 3} y={pos.y - 2} width="6" height="4" rx="1" fill="white" />
                </g>
              ))}
            </>
          )}

          {/* Active driver marker */}
          {animatedDriver && (rideStatus === "arriving" || rideStatus === "in-progress" || rideStatus === "accepted") && (
            <g>
              <circle cx={animatedDriver.x} cy={animatedDriver.y} r="20" fill="hsl(210, 100%, 55%)" opacity={0.1}>
                <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={animatedDriver.x} cy={animatedDriver.y} r="12" fill="hsl(210, 100%, 55%)" />
              {/* Car shape */}
              <rect x={animatedDriver.x - 5} y={animatedDriver.y - 3} width="10" height="6" rx="2" fill="white" />
              <rect x={animatedDriver.x - 3} y={animatedDriver.y - 5} width="6" height="3" rx="1" fill="white" opacity={0.6} />
            </g>
          )}
        </svg>
      </div>

      {/* Customer location pulse (center) */}
      {rideStatus === "idle" && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/40" />
            <div className="absolute inset-0 h-4 w-4 animate-pulse-dot rounded-full bg-primary/50" />
          </div>
        </div>
      )}

      {/* ETA overlay when driver is en route */}
      {rideStatus === "arriving" && (
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

      {rideStatus === "in-progress" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-ride-active/90 px-4 py-2 shadow-lg backdrop-blur-sm"
        >
          <p className="text-sm font-semibold text-accent-foreground">
            12 min to destination
          </p>
        </motion.div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 rounded bg-card/60 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
        Map loads with Mapbox token
      </div>
    </div>
  );
}
