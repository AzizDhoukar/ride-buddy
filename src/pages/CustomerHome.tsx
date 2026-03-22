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
import { Ride } from "@/services/types";
import { useWebSocket } from "@/services/webservice";

type UiState = "idle" | "destination" | "searching" | "active_ride";

export default function CustomerHome() {
  const { user, token } = useApp();
  const [uiState, setUiState] = useState<UiState>("idle");
  const [showChat, setShowChat] = useState(false);
  const [ride, setRide] = useState<Ride | null>(null);
  const {
    disconnect,
    unsubscribeFromRideRequests,
    sendLocation,
    subscribeToRideRequests
  } = useWebSocket();

  // Listen for ride updates via WebSocket
  useEffect(() => {
    const handleRideUpdate = (updatedRide: Ride) => {
      console.log('ride', ride);

      if (ride?.id === updatedRide.id) {
        console.log('[WS] Received ride update:', updatedRide);
        setRide(updatedRide);
        setUiState("active_ride");

        if (updatedRide.status === "completed" || updatedRide.status === "canceled") {
          setTimeout(() => {
            setRide(null);
            setUiState("idle");
          }, 3000);
        }
      }
    };
    return () => {
      disconnect();
    };
  }, [ride, user]);

  const handleRequestRide = () => {
    if (!user || !token) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUiState("searching");
        try {
          const response = await api.createRide(latitude, longitude, token);
          setRide({
            id: response.id,
            customerId: response.customerId,
            pickupLocation: {
              lat: response.latitude,
              lng: response.longitude,
            },
            status: response.status,
            createdAt: response.createdAt,
          });
          console.log('response', response);
          console.log('ride', ride);
        } catch (error) {
          console.error("Failed to create ride:", error);
          setUiState("idle");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        // Handle error case, maybe show a toast to the user
        alert("Could not get your location. Please enable location services.");
      }
    );
  };

  const handleCancelRide = async () => {
    if (!ride || !token) return;
    try {
      await api.cancelRide(ride.id, token);
      setRide(null);
      setUiState("idle");
    } catch (error) {
      console.error("Failed to cancel ride:", error);
    }
  };

  const getMapViewStatus = (): "idle" | "searching" | "accepted" | "arriving" | "in-progress" | "completed" => {
    if (!ride) return "idle";
    switch (ride.status) {
      case "pending": return "searching";
      case "accepted": return "accepted";
      case "arriving": return "arriving";
      case "completed": return "completed";
      default: return "idle";
    }
  };

  const renderActiveRidePanel = () => {

    console.log('uiState:', uiState);
    if (uiState === "searching") {
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

    if (["active_ride"].includes(uiState)) {
      const getStatusText = () => {
        switch (ride.status) {
          case "accepted": return { title: "Driver found!", subtitle: `Arriving in 4 min` };
          case "arriving": return { title: "Driver is arriving", subtitle: "Nearly at your pickup point" };
          case "in-progress": return { title: "Ride in Progress", subtitle: `Heading to Random Destination` };
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
          </div>
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-bold text-lg">
              {ride.driverName?.split(" ").map(n => n[0]).join("")}
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
              <MapPin size={14} className="text-primary" />
              <span className="text-muted-foreground">Current Location</span>
            </div>
            <div className="mx-1 text-muted-foreground">→</div>
            <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-sm">
              <MapPin size={14} className="text-accent" />
              <span className="text-muted-foreground">Random Destination</span>
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
        customerLocation={ride?.pickupLocation ? { latitude: ride.pickupLocation.lat, longitude: ride.pickupLocation.lng } : undefined}
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
            <Button size="lg" className="w-full text-base font-semibold" onClick={handleRequestRide}>
              <Navigation size={18} className="mr-2" /> Request a Ride
            </Button>
          </motion.div>
        )}

        {renderActiveRidePanel()}

      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
