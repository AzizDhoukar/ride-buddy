import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Star, Clock, Check, X } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import MapView from "@/components/MapView";
import BottomNav from "@/components/BottomNav";

export default function DriverHome() {
  const { user, isDriverOnline, setIsDriverOnline } = useApp();
  const [rideRequest, setRideRequest] = useState(false);
  const [activeRide, setActiveRide] = useState(false);

  const toggleOnline = () => {
    const next = !isDriverOnline;
    setIsDriverOnline(next);
    if (next) {
      // Simulate a ride request after going online
      setTimeout(() => setRideRequest(true), 4000);
    } else {
      setRideRequest(false);
    }
  };

  const acceptRide = () => {
    setRideRequest(false);
    setActiveRide(true);
  };

  const rejectRide = () => {
    setRideRequest(false);
  };

  const completeRide = () => {
    setActiveRide(false);
  };

  return (
    <div className="relative flex h-screen flex-col">
      <MapView className="flex-1" />

      {/* Top status bar */}
      <div className="safe-top absolute left-0 right-0 top-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isDriverOnline ? "bg-online animate-pulse-dot" : "bg-offline"
                }`}
              />
              <span className="text-sm font-medium">
                {isDriverOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          {isDriverOnline && !rideRequest && !activeRide && (
            <div className="rounded-full bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm">
              <p className="text-xs text-muted-foreground">Waiting for rides...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom panels */}
      <AnimatePresence mode="wait">
        {!isDriverOnline && !activeRide && (
          <motion.div
            key="offline"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">
                Ready to drive, {user?.name?.split(" ")[0] || "driver"}?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Go online to start receiving ride requests
              </p>
            </div>
            <Button
              size="lg"
              className="w-full text-base font-semibold"
              onClick={toggleOnline}
            >
              Go Online
            </Button>
            <div className="mt-4 flex justify-center gap-6 text-center">
              <div>
                <p className="text-lg font-bold">12</p>
                <p className="text-xs text-muted-foreground">Today's rides</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="flex items-center justify-center gap-1 text-lg font-bold">
                  4.9 <Star size={14} className="fill-accent text-accent" />
                </p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="text-lg font-bold">6h</p>
                <p className="text-xs text-muted-foreground">Online time</p>
              </div>
            </div>
          </motion.div>
        )}

        {isDriverOnline && !rideRequest && !activeRide && (
          <motion.div
            key="online"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 p-4"
          >
            <Button
              variant="destructive"
              size="lg"
              className="w-full text-base font-semibold"
              onClick={toggleOnline}
            >
              Go Offline
            </Button>
          </motion.div>
        )}

        {rideRequest && (
          <motion.div
            key="request"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">New Ride Request</h3>
              <div className="flex items-center gap-1 rounded-full bg-ride-pending/10 px-3 py-1">
                <Clock size={14} className="text-ride-pending" />
                <span className="text-sm font-medium text-ride-pending">15s</span>
              </div>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold">
                SJ
              </div>
              <div className="flex-1">
                <p className="font-semibold">Sarah J.</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-accent text-accent" />
                  <span className="text-xs text-muted-foreground">4.8 · 2.3 km away</span>
                </div>
              </div>
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span>123 Main Street</span>
              </div>
              <div className="ml-1 h-4 border-l border-dashed border-muted-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span>Central Mall, Downtown</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                size="lg"
                className="flex-1"
                onClick={rejectRide}
              >
                <X size={18} className="mr-1" />
                Decline
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={acceptRide}
              >
                <Check size={18} className="mr-1" />
                Accept
              </Button>
            </div>
          </motion.div>
        )}

        {activeRide && (
          <motion.div
            key="active"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-16 left-0 right-0 z-10 rounded-t-3xl bg-card p-6 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Active Ride</h3>
              <span className="rounded-full bg-ride-active/10 px-3 py-1 text-xs font-medium text-ride-active">
                In Progress
              </span>
            </div>
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span>123 Main Street</span>
              </div>
              <div className="ml-1 h-4 border-l border-dashed border-muted-foreground" />
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span>Central Mall, Downtown</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="flex-1">
                <Navigation size={18} className="mr-2" />
                Navigate
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={completeRide}
              >
                Complete Ride
              </Button>
            </div>
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
