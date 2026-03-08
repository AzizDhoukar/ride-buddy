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
  // Ride request is essentially a ride in 'pending' state
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


// Mock database
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
let mockMessages: Message[] = [];
let isDriverOnline = false;

// --- API FUNCTIONS ---

const API_BASE_URL = "http://localhost:9090/api";

const simulateDelay = <T>(data: T, delay = 400): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));


export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to login");
  }

  return response.json();
};

export const signup = async (name: string, email: string, phone: string, password: string, role: UserRole): Promise<{ user: User; token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign up");
  }
  const result = await response.json();

  return {
    user: {
      id: result.userId,
      name: name,
      email: result.email,
      phone: phone,
      role: result.role,
    },
    token: result.token,
  };
};


export const checkAuth = async (token: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Not authenticated");
  }

  return response.json();
};

export const logout = async (token: string): Promise<void> => {
  // In a real app, you might want to invalidate the token on the server
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
  return simulateDelay(newRide);
};

export const getRideStatus = async (rideId: string): Promise<Ride | null> => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride) return simulateDelay(null);

  // Simulate driver being found
  if (ride.status === 'pending' && Math.random() > 0.5) {
    ride.status = 'accepted';
    ride.driverId = 'driver-007';
    ride.driverName = 'Ahmed K.';
    ride.driverRating = 4.9;
    ride.vehicle = 'White Toyota Camry · ABC 123';
    ride.driverLocation = { lat: 34.055, lng: -118.245 };
  } else if (ride.status === 'accepted') {
    ride.status = 'arriving';
  } else if (ride.status === 'arriving') {
    ride.status = 'in-progress';
  }

  return simulateDelay(ride);
};

export const cancelRide = async (rideId: string): Promise<{ success: boolean }> => {
  const ride = mockRides.find(r => r.id === rideId);
  if (ride) {
    ride.status = 'canceled';
  }
  return simulateDelay({ success: !!ride });
};


// --- DRIVER API ---

export const setOnlineStatus = async (isOnline: boolean): Promise<{ success: boolean }> => {
  isDriverOnline = isOnline;
  if (!isOnline) {
    // When driver goes offline, clear pending requests for them
    mockRides = mockRides.filter(r => r.status !== 'pending');
  }
  return simulateDelay({ success: true });
};

export const getRideRequests = async (): Promise<RideRequest[]> => {
  if (!isDriverOnline) return simulateDelay([]);

  const pendingRides = mockRides.filter(r => r.status === 'pending');
  console.log('pendingRides', pendingRides);
  
  const requests: RideRequest[] = pendingRides.map(r => ({
    ...r,
    customerRating: 4.8,
    distance: 2.3,
  }));
  return simulateDelay(requests);
};

export const acceptRide = async (rideId: string, driver: User): Promise<Ride> => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride || ride.status !== 'pending') {
    throw new Error("Ride not available");
  }
  ride.status = 'accepted';
  ride.driverId = driver.id;
  ride.driverName = driver.name;
  ride.driverRating = 4.9; // default rating
  ride.vehicle = 'Black Honda Civic · XYZ 789';
  ride.driverLocation = { lat: 34.06, lng: -118.25 };
  return simulateDelay(ride);
};

export const rejectRide = async (rideId: string): Promise<{ success: boolean }> => {
  // In a real system, this would just remove the request from the current driver's queue.
  // Here, we'll just remove it from the mock DB for simplicity.
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