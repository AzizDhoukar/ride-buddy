import { UserRole, User } from "@/contexts/AppContext";
import { Ride, DriverDashboard, Message } from "./types";
import { mockRides, mockMessages, newMessageId, isDriverOnline } from "./mockData";
import { useWebSocket } from "./webservice";


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
  const {
    disconnect
  } = useWebSocket();

  disconnect();
  // In a real application, you would send a request to the backend to invalidate the token
  console.log("Token invalidated (simulated):", token);
  return Promise.resolve();
};

// --- CUSTOMER API ---

export const createRide = async (lat: number, lng: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/rides`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      pickupLatitude: lat,
      pickupLongitude: lng,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create ride");
  }

  return response.json();
};

export const cancelRide = async (rideId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/rides/${rideId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      cancellationReason: 'nothing for now'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to cancel ride");
  }

  return response.json();
};

// --- DRIVER API ---

export const setOnlineStatus = async (isOnline: boolean, useId:string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/drivers/me/profile/online`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId: useId,
      isOnline: isOnline
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to cancel ride");
  }
};

export const acceptRide = async (rideId: string, token: string): Promise<Ride> => {
    const response = await fetch(`${API_BASE_URL}/ride-requests/${rideId}/accept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to accept ride");
  }

  const data = await response.json();
  let ride: Ride = {
    id: data.id,
    customerId: data.customerId,
    driverId: data.driverId,
    pickupLocation: {
      lat: data.pickupLatitude,
      lng: data.pickupLongitude
    },
    status: data.status,
    createdAt: data.requestedAt
  };

  return ride;
};

export const rejectRide = async (rideId: string): Promise<{ success: boolean }> => {
  const initialLength = mockRides.length;
  let rides = mockRides.filter(r => r.id !== rideId);
  (mockRides as any) = rides;
  return simulateDelay({ success: mockRides.length < initialLength });
};

export const updateRideStatus = async (rideId: string, status: "IN_PROGRESS" | "COMPLETED"): Promise<Ride> => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride) throw new Error("Ride not found");
  ride.status = status;
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

