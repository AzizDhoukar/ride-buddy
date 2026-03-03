import { Star, MapPin, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const mockRides = [
  {
    id: "1",
    pickup: "123 Main Street",
    destination: "Central Mall",
    date: "Today, 2:30 PM",
    status: "completed",
    rating: 5,
    driver: "Ahmed K.",
  },
  {
    id: "2",
    pickup: "Airport Terminal 1",
    destination: "Hotel Grand",
    date: "Yesterday, 8:15 AM",
    status: "completed",
    rating: 4,
    driver: "Maria L.",
  },
  {
    id: "3",
    pickup: "Office Park",
    destination: "Home",
    date: "Mar 1, 6:00 PM",
    status: "cancelled",
    rating: null,
    driver: "John D.",
  },
];

export default function Rides() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="safe-top px-6 pt-6">
        <h1 className="mb-6 text-2xl font-bold">Your Rides</h1>
        <div className="space-y-3">
          {mockRides.map((ride) => (
            <div
              key={ride.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{ride.date}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    ride.status === "completed"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {ride.status}
                </span>
              </div>
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{ride.pickup}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <span>{ride.destination}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Driver: {ride.driver}
                </span>
                {ride.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: ride.rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className="fill-accent text-accent"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
