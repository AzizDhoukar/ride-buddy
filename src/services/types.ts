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
