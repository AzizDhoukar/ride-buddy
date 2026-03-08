import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, Star, Phone, MessageCircle, CreditCard } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import BottomNav from "@/components/BottomNav";
import ChatWindow from "@/components/ChatWindow";
import * as api from "@/services/api";

type UiState = "idle" | "destination" | "searching" | "active_ride";

export default function CustomerHome() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [uiState, setUiState] = useState<UiState>("idle");
  const [pickup, setPickup] = useState("Current Location");
  const [destination, setDestination] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [ride, setRide] = useState<api.Ride | null>(null);

  // Polling for ride status
  useEffect(() => {
    if (ride && ["pending", "accepted", "arriving", "in-progress"].includes(ride.status)) {
      const interval = setInterval(async () => {
        const updatedRide = await api.getRideStatus(ride.id);
        if (updatedRide) {
          setRide(updatedRide);
          if (updatedRide.status === "completed" || updatedRide.status === "canceled") {
            clearInterval(interval);
            setRide(null);
            setUiState("idle");
          }
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [ride]);

  const handleSearch = async () => {
    if (!destination || !user) return;
    setUiState("searching");
    try {
      const newRide = await api.createRide(pickup, destination, user);
      setRide(newRide);
      setUiState("active_ride");
    } catch (error) {
      console.error("Failed to create ride:", error);
      setUiState("destination"); // Go back to destination selection on error
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;
    await api.cancelRide(ride.id);
    setRide(null);
    setDestination("");
    setShowChat(false);
    setUiState("idle");
  };

  const getMapViewStatus = (): "idle" | "searching" | "accepted" | "arriving" | "in-progress" | "completed" => {
    if (!ride) return "idle";
    switch (ride.status) {
      case "pending": return "searching";
      case "accepted": return "accepted";
      case "arriving": return "arriving";
      case "in-progress": return "in-progress";
      case "completed": return "completed";
      default: return "idle";
    }
  };

  const renderActiveRidePanel = () => {
    if (!ride) return null;

    if (ride.status === "pending") {
      return (
        <motion.div key="searching" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
          <div className="flex flex-col items-center py-4">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <h3 className="mb-1 text-lg font-bold">Finding your ride...</h3>
            <p className="text-sm text-muted-foreground">Looking for nearby drivers</p>
            <Button variant="ghost" className="mt-4 text-destructive" onClick={handleCancelRide}>Cancel</Button>
          </div>
        </motion.div>
      );
    }

    if (["accepted", "arriving", "in-progress"].includes(ride.status)) {
      const getStatusText = () => {
        switch (ride.status) {
          case "accepted": return { title: "Driver found!", subtitle: `Arriving in 4 min` };
          case "arriving": return { title: "Driver is arriving", subtitle: "Nearly at your pickup point" };
          case "in-progress": return { title: "Ride in Progress", subtitle: `Heading to ${destination}` };
          default: return { title: "", subtitle: "" };
        }
      };
      const { title, subtitle } = getStatusText();

      return (
        <motion.div key="driver-found" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-primary font-medium">{title}</p>
              <h3 className="text-lg font-bold">{subtitle}</h3>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
              <Star size={14} className="text-accent fill-accent" />
              <span className="text-sm font-semibold">{ride.driverRating || "N/A"}</span>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-bold text-lg">
              {ride.driverName?.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{ride.driverName}</p>
              <p className="text-sm text-muted-foreground">{ride.vehicle}</p>
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
              <MapPin size={14} className="text-primary" />
              <span className="text-muted-foreground">{pickup}</span>
            </div>
            <div className="mx-1 text-muted-foreground">→</div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
              <MapPin size={14} className="text-accent" />
              <span className="text-muted-foreground">{destination}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => { }}>
              <Phone size={18} className="mr-2" /> Call
            </Button>
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setShowChat(true)}>
              <MessageCircle size={18} className="mr-2" /> Chat
            </Button>
            <Button variant="destructive" size="lg" className="flex-1" onClick={handleCancelRide}>Cancel</Button>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            💰 Payment is handled directly between driver and customer.
          </p>
        </motion.div>
      );
    }

    return null;
  };


  return (
    <div className="relative flex h-screen flex-col">
      <MapView
        className="flex-1"
        rideStatus={getMapViewStatus()}
        showRoute={!!ride && ride.status !== "pending"}
        driverLocation={ride?.driverLocation ? { latitude: ride.driverLocation.lat, longitude: ride.driverLocation.lng } : undefined}
        pickupLocation={ride?.pickupLocation ? { latitude: ride.pickupLocation.lat, longitude: ride.pickupLocation.lng } : undefined}
        dropoffLocation={ride?.destinationLocation ? { latitude: ride.destinationLocation.lat, longitude: ride.destinationLocation.lng } : undefined}
      />

      {/* Top bar */}
      <div className="safe-top absolute left-0 right-0 top-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm">
            <p className="text-sm font-medium">
              Hello, <span className="text-primary">{user?.name?.split(" ")[0] || "there"}</span> 👋
            </p>
          </div>
          {ride && ["accepted", "arriving", "in-progress"].includes(ride.status) && (
            <button
              onClick={() => setShowChat(!showChat)}
              className="rounded-full bg-card/90 p-2.5 shadow-lg backdrop-blur-sm"
            >
              <MessageCircle size={20} className="text-primary" />
            </button>
          )}
        </div>
      </div>

      {/* Embedded chat overlay */}
      <AnimatePresence>
        {showChat && ride && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-16 top-16 z-30"
          >
            <ChatWindow
              recipientName={ride.driverName || "Driver"}
              recipientInitials={ride.driverName?.split(" ").map(n => n[0]).join("") || "DR"}
              onClose={() => setShowChat(false)}
              className="h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom panels */}
      <AnimatePresence mode="wait">
        {uiState === "idle" && (
          <motion.div key="idle" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
            <h2 className="mb-4 text-lg font-bold">Where to?</h2>
            <button onClick={() => setUiState("destination")}
              className="flex w-full items-center gap-3 rounded-xl bg-secondary p-4 text-left transition-colors hover:bg-secondary/80">
              <Search size={20} className="text-muted-foreground" />
              <span className="text-muted-foreground">Enter destination</span>
            </button>
            <div className="mt-4 flex gap-3">
              {["Home", "Work", "Airport"].map((place) => (
                <button key={place} onClick={() => { setDestination(place); setUiState("destination"); }}
                  className="rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground">
                  {place}
                </button>
              ))}
            </div>
            <button onClick={() => navigate("/payment-methods")}
              className="mt-3 flex w-full items-center gap-2 rounded-xl p-3 text-sm text-muted-foreground transition-colors hover:bg-secondary">
              <CreditCard size={16} />
              <span>Payment: Cash (default)</span>
            </button>
          </motion.div>
        )}

        {uiState === "destination" && (
          <motion.div key="destination" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Set Route</h2>
              <button onClick={() => setUiState("idle")}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Pickup location" />
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-secondary p-3">
                <div className="h-3 w-3 rounded-full bg-accent" />
                <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where to?" autoFocus />
              </div>
            </div>
            <Button size="lg" className="w-full text-base font-semibold" onClick={handleSearch} disabled={!destination}>
              <Navigation size={18} className="mr-2" /> Find a Ride
            </Button>
          </motion.div>
        )}

        {uiState === "active_ride" && renderActiveRidePanel()}

      </AnimatePresence>

      <BottomNav />
    </div>
  );
}