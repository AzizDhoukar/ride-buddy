import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, Clock, Check, X, MessageCircle, Phone, DollarSign } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import BottomNav from "@/components/BottomNav";
import ChatWindow from "@/components/ChatWindow";
import * as api from "@/services/api";

export default function DriverHome() {
  const { user, isDriverOnline, setIsDriverOnline } = useApp();
  const navigate = useNavigate();
  const [rideRequest, setRideRequest] = useState<api.RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<api.Ride | null>(null);
  const [dashboard, setDashboard] = useState<api.DriverDashboard | null>(null);
  const [showChat, setShowChat] = useState(false);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    api.getDriverDashboard().then(setDashboard);
  }, []);

  // Polling for ride requests
  useEffect(() => {
    if (isDriverOnline && !rideRequest && !activeRide) {
      const interval = setInterval(async () => {
        const requests = await api.getRideRequests();
        if (requests.length > 0) {
          setRideRequest(requests[0]); // Take the first request
        }
      }, 4000); // Poll every 4 seconds

      return () => clearInterval(interval);
    }
  }, [isDriverOnline, rideRequest, activeRide]);

  const toggleOnline = async () => {
    const next = !isDriverOnline;
    await api.setOnlineStatus(next);
    setIsDriverOnline(next);
    if (!next) {
      setRideRequest(null);
    }
  };

  const handleAcceptRide = async () => {
    if (!rideRequest || !user) return;
    try {
      const accepted = await api.acceptRide(rideRequest.id, user);
      setActiveRide(accepted);
      setRideRequest(null);
    } catch (error) {
      console.error("Failed to accept ride:", error);
      setRideRequest(null); // Clear request if it's no longer valid
    }
  };

  const handleRejectRide = async () => {
    if (!rideRequest) return;
    await api.rejectRide(rideRequest.id);
    setRideRequest(null);
  };

  const handleCompleteRide = async () => {
    if (!activeRide) return;
    await api.updateRideStatus(activeRide.id, "completed");
    setActiveRide(null);
    setShowChat(false);
    // Refetch dashboard to show updated earnings/stats
    api.getDriverDashboard().then(setDashboard);
  };

  const getMapViewStatus = () => {
    if (activeRide) return activeRide.status;
    if (rideRequest) return "accepted"; // Show route to pickup
    return "idle";
  };

  return (
    <div className="relative flex h-screen flex-col">
      <MapView className="flex-1" rideStatus={getMapViewStatus()} showRoute={!!activeRide || !!rideRequest} />

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
              <h3 className="text-lg font-bold">Active Ride</h3>
              <span className="rounded-full bg-ride-active/10 px-3 py-1 text-xs font-medium text-ride-active">
                {activeRide.status === "in-progress" ? "In Progress" : "Arriving"}
              </span>
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
            <Button size="lg" className="mt-3 w-full" onClick={handleCompleteRide}>Complete Ride</Button>
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