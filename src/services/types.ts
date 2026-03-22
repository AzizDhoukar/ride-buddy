import { UserRole, User } from "@/contexts/AppContext";

// --- MOCK DATA AND TYPES ---

export type RideStatus = "pending" | "in-progress" | "completed" | "canceled";

export interface Ride {
  id: string;
  customerId: string;
  customerName?: string;
  driverId?: string;
  driverName?: string;
  driverLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number };
  status: RideStatus;
  createdAt: number;
}

export interface RideRequest extends Ride {
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

export interface UpdateLocation {
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
