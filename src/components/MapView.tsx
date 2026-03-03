import { useEffect, useRef } from "react";

interface MapViewProps {
  className?: string;
}

export default function MapView({ className = "" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={mapRef} className={`relative bg-muted ${className}`}>
      {/* Stylized placeholder map */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="h-full w-full opacity-20" viewBox="0 0 400 400">
          {/* Grid lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <line
                x1={i * 20}
                y1={0}
                x2={i * 20}
                y2={400}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
                className="text-muted-foreground"
              />
              <line
                x1={0}
                y1={i * 20}
                x2={400}
                y2={i * 20}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 1.5 : 0.5}
                className="text-muted-foreground"
              />
            </g>
          ))}
          {/* Roads */}
          <path d="M0,200 Q100,180 200,200 T400,200" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground opacity-60" />
          <path d="M200,0 Q180,100 200,200 T200,400" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground opacity-60" />
          <path d="M50,50 Q150,150 350,100" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground opacity-40" />
          <path d="M100,350 Q200,250 350,300" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground opacity-40" />
        </svg>
      </div>
      {/* Center dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="h-4 w-4 rounded-full bg-primary shadow-lg shadow-primary/40" />
          <div className="absolute inset-0 h-4 w-4 animate-pulse-dot rounded-full bg-primary/50" />
        </div>
      </div>
      {/* Map attribution placeholder */}
      <div className="absolute bottom-2 right-2 rounded bg-card/60 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
        Map loads with Mapbox token
      </div>
    </div>
  );
}
