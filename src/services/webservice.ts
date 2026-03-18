import { mockRides, isDriverOnline, serverIntervals } from "./mockData";
import { RideRequest } from "./types";

// --- WEBSOCKET SIMULATION ---

type WsEvent = 'ride-update' | 'new-ride-request' | 'location-update';
type WsListener = (data: unknown) => void;

const listeners = new Map<WsEvent, WsListener[]>();

const websocket = {
  connect: (userId: string) => {
    console.log(`[WS] Simulating connection for user: ${userId}`);
    
    if (serverIntervals.length === 0) {
      console.log("[WS Server] Starting backend processes...");
      const rideRequestInterval = setInterval(() => {
        if (isDriverOnline) {
          const pendingRide = mockRides.find(r => r.status === 'pending' && !r.driverId);
          if (pendingRide) {
            console.log(`[WS Server] Found pending ride ${pendingRide.id}, pushing to drivers.`);
            const rideRequest: RideRequest = { ...pendingRide, customerRating: 4.8, distance: 2.3 };
            websocket.trigger('new-ride-request', rideRequest);
          }
        }
      }, 8000);

      const rideStatusInterval = setInterval(() => {
        const acceptedRides = mockRides.filter(r => r.status === 'accepted' || r.status === 'arriving');
        acceptedRides.forEach(ride => {
            if (ride.status === 'accepted') ride.status = 'arriving';
            else if (ride.status === 'arriving') ride.status = 'in-progress';
            console.log(`[WS Server] Auto-updated ride ${ride.id} to ${ride.status}`);
            websocket.trigger('ride-update', ride);
        });
      }, 10000);

      serverIntervals.push(rideRequestInterval, rideStatusInterval);
    }
  },

  disconnect: () => {
    console.log("[WS] Simulating disconnection.");
    serverIntervals.forEach(clearInterval);
    serverIntervals = [];
    listeners.clear();
  },
  
  on: (event: WsEvent, listener: WsListener) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event)?.push(listener);
    console.log(`[WS] Registered listener for event: ${event}`);
  },

  off: (event: WsEvent, listener: WsListener) => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
        console.log(`[WS] Deregistered listener for event: ${event}`);
      }
    }
  },

  emit: (event: WsEvent, data: any) => {
    console.log(`[WS] App emitted event: ${event}`, data);
    if (event === 'location-update') {
      const { rideId, location } = data;
      const ride = mockRides.find(r => r.id === rideId);
      if (ride) {
        ride.driverLocation = location;
        setTimeout(() => {
            console.log(`[WS Server] Pushing ride-update for ${rideId}`);
            websocket.trigger('ride-update', ride);
        }, 200);
      }
    }
  },

  trigger: (event: WsEvent, data: unknown) => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      console.log(`[WS] Triggering event ${event} for ${eventListeners.length} listeners`);
      eventListeners.forEach(listener => listener(JSON.parse(JSON.stringify(data))));
    }
  }
};

export { websocket };
