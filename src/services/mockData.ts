import { Ride, Message } from "./types";

// --- MOCK DATABASE & HELPERS ---
export const newRideId = () => `ride_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
export const newMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export let mockRides: Ride[] = [
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
export let mockMessages: Message[] = [];
export let isDriverOnline = false;
export let serverIntervals: NodeJS.Timeout[] = [];
