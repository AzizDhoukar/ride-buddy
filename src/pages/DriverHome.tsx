import { lerp } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, Clock, Check, X, MessageCircle, Phone, DollarSign } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import BottomNav from "@/components/BottomNav";
import ChatWindow from "@/components/ChatWindow";
import * as webservice from "@/services/webservice";
import { DriverDashboard, Ride, RideRequest } from "@/services/types";
import { acceptRide, getDriverDashboard, rejectRide, setOnlineStatus, updateRideStatus } from "@/services/api";
import { websocket } from "@/services/webservice";

export default function DriverHome() {
  const { user, isDriverOnline, setIsDriverOnline } = useApp();
  const navigate = useNavigate();
  const [rideRequest, setRideRequest] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [showChat, setShowChat] = useState(false);
  const movementProgress = useRef(0);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    getDriverDashboard().then(setDashboard);
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    const handleNewRequest = (request: RideRequest) => {
      if (isDriverOnline && !rideRequest && !activeRide) {
        console.log('[WS] Received new ride request:', request);
        setRideRequest(request);
      }
    };

    const handleRideUpdate = (updatedRide: Ride) => {
      if (activeRide?.id === updatedRide.id && updatedRide.status === 'canceled') {
        console.log('[WS] Active ride was canceled by customer:', updatedRide);
        setActiveRide(null);
        setShowChat(false);
        movementProgress.current = 0;
      }
    };

    websocket.on('new-ride-request', handleNewRequest);
    websocket.on('ride-update', handleRideUpdate);

    return () => {
      websocket.off('new-ride-request', handleNewRequest);
      websocket.off('ride-update', handleRideUpdate);
    };
  }, [isDriverOnline, rideRequest, activeRide]);

  // Broadcast location when on an active ride
  useEffect(() => {
    if (!activeRide || !activeRide.driverLocation || !activeRide.pickupLocation) return;

    const locationInterval = setInterval(() => {
      const startLat = activeRide.driverLocation.lat;
      const startLng = activeRide.driverLocation.lng;
      const endLat = activeRide.pickupLocation.lat;
      const endLng = activeRide.pickupLocation.lng;

      // Simulate movement towards pickup, then towards destination
      const targetLat = activeRide.status === "arriving" ? endLat : activeRide.destinationLocation.lat;
      const targetLng = activeRide.status === "arriving" ? endLng : activeRide.destinationLocation.lng;

      if (movementProgress.current < 1) {
        movementProgress.current += 0.05; // Move 5% of the way each interval
        const newLat = lerp(startLat, targetLat, movementProgress.current);
        const newLng = lerp(startLng, targetLng, movementProgress.current);

        const newLocation = { lat: newLat, lng: newLng };

        websocket.emit('location-update', {
          rideId: activeRide.id,
          location: newLocation,
        });

        setActiveRide(prev => prev ? { ...prev, driverLocation: newLocation } : null);
      } else {
        // Optionally, stop the interval when destination is reached
        // clearInterval(locationInterval);
      }
    }, 1000); // Update every second

    return () => clearInterval(locationInterval);
  }, [activeRide]);

  const toggleOnline = async () => {
    const next = !isDriverOnline;
    await setOnlineStatus(next);
    setIsDriverOnline(next);
    if (!next) {
      setRideRequest(null);
    }
  };

  const handleAcceptRide = async () => {
    if (!rideRequest || !user) return;
    try {
      const accepted = await acceptRide(rideRequest.id, user);
      setActiveRide(accepted);
      setRideRequest(null);
      movementProgress.current = 0; // Reset progress
    } catch (error) {
      console.error("Failed to accept ride:", error);
      setRideRequest(null);
    }
  };

  const handleRejectRide = async () => {
    if (!rideRequest) return;
    await rejectRide(rideRequest.id);
    setRideRequest(null);
  };

  const handleUpdateRideStatus = async (status: "arriving" | "in-progress") => {
    if (!activeRide) return;
    await updateRideStatus(activeRide.id, status);
    setActiveRide(prev => prev ? { ...prev, status } : null);
    movementProgress.current = 0; // Reset for next leg
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    await updateRideStatus(activeRide.id, "completed");
    setActiveRide(null);
    setShowChat(false);
    movementProgress.current = 0;
    getDriverDashboard().then(setDashboard);
  };

  const getMapViewStatus = () => {
    if (activeRide) return activeRide.status;
    if (rideRequest) return "accepted";
    return "idle";
  };

  const currentRide = activeRide || rideRequest;

  return (
    <div className="relative flex h-screen flex-col">
      <MapView
        className="flex-1"
        rideStatus={getMapViewStatus()}
        showRoute={!!currentRide}
        driverLocation={activeRide?.driverLocation ? { latitude: activeRide.driverLocation.lat, longitude: activeRide.driverLocation.lng } : undefined}
        pickupLocation={currentRide?.pickupLocation ? { latitude: currentRide.pickupLocation.lat, longitude: currentRide.pickupLocation.lng } : undefined}
        dropoffLocation={currentRide?.destinationLocation ? { latitude: currentRide.destinationLocation.lat, longitude: currentRide.destinationLocation.lng } : undefined}
        customerLocation={currentRide?.pickupLocation ? { latitude: currentRide.pickupLocation.lat, longitude: currentRide.pickupLocation.lng } : undefined}
      />

      {/* Top status bar */}
      <div className="safe-top absolute left-0 right-0 top-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isDriverOnline ? "bg-online animate-pulse-dot" : "bg-offline"}`} />
              <span className="text-sm font-medium">{isDriverOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeRide && (
              <button onClick={() => setShowChat(!showChat)} className="rounded-full bg-card/90 p-2.5 shadow-lg backdrop-blur-sm">
                <MessageCircle size={20} className="text-primary" />
              </button>
            )}
            {isDriverOnline && (
              <button onClick={() => navigate("/earnings")} className="rounded-full bg-card/90 p-2.5 shadow-lg backdrop-blur-sm">
                <DollarSign size={20} className="text-primary" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Embedded chat overlay */}
      <AnimatePresence>
        {showChat && activeRide && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-x-0 bottom-16 top-16 z-30">
            <ChatWindow
              recipientName={activeRide.customerName}
              recipientInitials={activeRide.customerName.split(" ").map(n => n[0]).join("")}
              onClose={() => setShowChat(false)}
              className="h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom panels */}
      <AnimatePresence mode="wait">
        {!isDriverOnline && !activeRide && (
          <motion.div key="offline" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Ready to drive, {user?.name?.split(" ")[0] || "driver"}?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Go online to start receiving ride requests</p>
            </div>
            <Button size="lg" className="w-full text-base font-semibold" onClick={toggleOnline}>Go Online</Button>
            <div className="mt-4 flex justify-center gap-6 text-center">
              <div>
                <p className="text-lg font-bold">{dashboard?.todayRides ?? "..."}</p>
                <p className="text-xs text-muted-foreground">Today's rides</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-bold">
                  {dashboard?.rating ?? "..."} <Star size={14} className="fill-accent text-accent" />
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-lg font-bold">${dashboard?.totalEarned ?? "..."}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
            </div>
            <button onClick={() => navigate("/earnings")}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl p-2 text-sm text-primary transition-colors hover:bg-primary/5">
              <DollarSign size={16} /> View Earnings
            </button>
          </motion.div>
        )}

        {isDriverOnline && !rideRequest && !activeRide && (
          <motion.div key="online" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 p-4">
            <Button variant="destructive" size="lg" className="w-full text-base font-semibold" onClick={toggleOnline}>
              Go Offline
            </Button>
          </motion.div>
        )}

        {rideRequest && (
          <motion.div key="request" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">New Ride Request</h3>
              <div className="flex items-center gap-1 rounded-full bg-ride-pending/10 px-3 py-1">
                <Clock size={14} className="text-ride-pending" />
                <span className="text-sm font-medium text-ride-pending">15s</span>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                {rideRequest.customerName.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{rideRequest.customerName}</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-accent text-accent" />
                  <span className="text-xs text-muted-foreground">{rideRequest.customerRating} · {rideRequest.distance} km away</span>
                </div>
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" /> <span>{rideRequest.pickupLocation.address}</span>
              </div>
              <div className="ml-1 h-4 border-l border-dashed border-muted-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" /> <span>{rideRequest.destinationLocation.address}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="destructive" size="lg" className="flex-1" onClick={handleRejectRide}>
                <X size={18} className="mr-1" /> Decline
              </Button>
              <Button size="lg" className="flex-1" onClick={handleAcceptRide}>
                <Check size={18} className="mr-1" /> Accept
              </Button>
            </div>
          </motion.div>
        )}

        {activeRide && (
          <motion.div key="active" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {activeRide.status === "arriving" ? "Arriving at Pickup" : "En Route to Destination"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeRide.status === "arriving"
                    ? `Picking up ${activeRide.customerName}`
                    : `Dropping off ${activeRide.customerName}`}
                </p>
              </div>
              <span className="rounded-full bg-ride-active/10 px-3 py-1 text-xs font-medium text-ride-active">
                {activeRide.status === "in-progress" ? "In Progress" : "Arriving"}
              </span>
            </div>

            <div className="my-4 h-2 rounded-full bg-secondary">
              <motion.div
                className="h-2 rounded-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: `${movementProgress.current * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" /> <span>{activeRide.pickupLocation.address}</span>
              </div>
              <div className="ml-1 h-4 border-l border-dashed border-muted-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" /> <span>{activeRide.destinationLocation.address}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1">
                <Navigation size={18} className="mr-2" /> Navigate
              </Button>
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setShowChat(true)}>
                <MessageCircle size={18} className="mr-2" /> Chat
              </Button>
            </div>

            {activeRide.status === "arriving" && (
              <Button size="lg" className="mt-3 w-full" onClick={() => handleUpdateRideStatus("in-progress")}>
                Confirm Pickup
              </Button>
            )}
            {activeRide.status === "in-progress" && (
              <Button size="lg" className="mt-3 w-full" onClick={handleCompleteRide}>
                Complete Ride
              </Button>
            )}

            <p className="mt-3 text-center text-xs text-muted-foreground">
              💰 Payment is handled directly between driver and customer.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
