import { UserRole, User } from "@/contexts/AppContext";

// --- MOCK DATA AND TYPES ---

export type RideStatus = "pending" | "accepted" | "arriving" | "in-progress" | "completed" | "canceled";

export interface Ride {
  id: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  driverLocation?: { lat: number; lng: number };
  driverRating?: number;
  vehicle?: string;
  pickupLocation: { lat: number; lng: number; address: string };
  destinationLocation: { lat: number; lng: number; address: string };
  status: RideStatus;
  fare?: number;
  createdAt: number;
}

export interface RideRequest extends Ride {
  customerRating: number;
  distance: number; // in km
}

export interface Message {
  id: string;
  rideId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface DriverDashboard {
  todayRides: number;
  rating: number;
  totalEarned: number;
}

// --- MOCK DATABASE & HELPERS ---
const newRideId = () => `ride_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const newMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

let mockRides: Ride[] = [
  {
    id: newRideId(),
    customerId: 'user_customer_1',
    customerName: 'John Doe',
    pickupLocation: { lat: 34.0722, lng: -118.2637, address: 'Dodger Stadium' },
    destinationLocation: { lat: 34.043, lng: -118.2673, address: 'Staples Center' },
    status: 'pending',
    createdAt: Date.now() - 10000,
  },
  {
    id: newRideId(),
    customerId: 'user_customer_2',
    customerName: 'Jane Smith',
    pickupLocation: { lat: 34.1186, lng: -118.3004, address: 'Griffith Observatory' },
    destinationLocation: { lat: 34.0639, lng: -118.3592, address: 'The Grove' },
    status: 'pending',
    createdAt: Date.now() - 25000,
  }
];
const mockMessages: Message[] = [];
let isDriverOnline = false;
let serverIntervals: NodeJS.Timeout[] = [];


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


// --- API FUNCTIONS (REST) ---

const API_BASE_URL = "http://localhost:9090/api";
const simulateDelay = <T>(data: T, delay = 400): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to login");
  }
  const result = await response.json();
  return {
    user: { id: result.userId, name: result.name, email: result.email, phone: result.phone, role: result.role },
    token: result.token,
  };
};

export const signup = async (name: string, email: string, phone: string, password: string, role: UserRole): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign up");
  }
  const result = await response.json();
  return {
    user: { id: result.userId, name, email, phone, role: result.role },
    token: result.token,
  };
};

export const checkAuth = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Not authenticated");
  return response.json();
};

export const logout = async (token: string): Promise<void> => {
  websocket.disconnect();
  // In a real application, you would send a request to the backend to invalidate the token
  console.log("Token invalidated (simulated):", token);
  return Promise.resolve();
};

// --- CUSTOMER API ---

export const createRide = async (pickup: string, destination: string, customer: User): Promise<Ride> => {
  const newRide: Ride = {
    id: newRideId(),
    customerId: customer.id,
    customerName: customer.name,
    pickupLocation: { lat: 34.0522, lng: -118.2437, address: pickup },
    destinationLocation: { lat: 34.0522, lng: -118.2437, address: destination },
    status: "pending",
    createdAt: Date.now(),
  };
  mockRides.push(newRide);
  websocket.trigger('ride-update', newRide);
  return simulateDelay(newRide);
};

export const cancelRide = async (rideId: string): Promise<{ success: boolean }> => {
  const ride = mockRides.find(r => r.id === rideId);
  if (ride) {
    ride.status = 'canceled';
    websocket.trigger('ride-update', ride);
  }
  return simulateDelay({ success: !!ride });
};

// --- DRIVER API ---

export const setOnlineStatus = async (isOnline: boolean): Promise<{ success: boolean }> => {
  isDriverOnline = isOnline;
  return simulateDelay({ success: true });
};

export const acceptRide = async (rideId: string, driver: User): Promise<Ride> => {
  const ride = mockRides.find(r => r.id === rideId && r.status === 'pending');
  if (!ride) throw new Error("Ride not available");
  
  ride.status = 'accepted';
  ride.driverId = driver.id;
  ride.driverName = driver.name;
  ride.driverRating = 4.9;
  ride.vehicle = 'Black Honda Civic · XYZ 789';
  ride.driverLocation = { lat: 34.06, lng: -118.25 };
  
  websocket.trigger('ride-update', ride);
  return simulateDelay(ride);
};

export const rejectRide = async (rideId: string): Promise<{ success: boolean }> => {
  const initialLength = mockRides.length;
  mockRides = mockRides.filter(r => r.id !== rideId);
  return simulateDelay({ success: mockRides.length < initialLength });
};

export const updateRideStatus = async (rideId: string, status: "arriving" | "in-progress" | "completed"): Promise<Ride> => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride) throw new Error("Ride not found");
  ride.status = status;
  if (status === 'completed') {
    ride.fare = 15.50;
  }
  websocket.trigger('ride-update', ride);
  return simulateDelay(ride);
};

export const getDriverDashboard = async (): Promise<DriverDashboard> => {
  const dashboardData: DriverDashboard = {
    todayRides: 12,
    rating: 4.9,
    totalEarned: 127,
  };
  return simulateDelay(dashboardData);
};

// --- CHAT API (Simulated) ---

export const getMessages = async (rideId: string): Promise<Message[]> => {
  const rideMessages = mockMessages.filter(m => m.rideId === rideId);
  return simulateDelay(rideMessages);
};

export const sendMessage = async (rideId: string, senderId: string, text: string): Promise<Message> => {
  const newMessage: Message = {
    id: newMessageId(),
    rideId,
    senderId,
    text,
    timestamp: Date.now(),
  };
  mockMessages.push(newMessage);
  return simulateDelay(newMessage);
};
