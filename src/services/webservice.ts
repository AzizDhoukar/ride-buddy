import { useApp } from '@/contexts/AppContext';
import * as StompJs from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Ride } from './types';

export const useWebSocket = () => {
    const { token } = useApp();

    const stompClientRef = useRef<StompJs.Client | null>(null);
    const locationSubscriptionRef = useRef<StompJs.StompSubscription | null>(null);
    const rideRequestSubscriptionRef = useRef<StompJs.StompSubscription | null>(null);
    const rideUpdateSubscriptionRef = useRef<StompJs.StompSubscription | null>(null);

    useEffect(() => {
        const client = new StompJs.Client({
            webSocketFactory: () => new SockJS('http://localhost:9090/ws'),
            connectHeaders: {
                token: token || '',
            },
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log("✅ Connected to WebSocket");
        };

        client.onStompError = (frame) => {
            console.error('Broker error:', frame.headers['message']);
            console.error('Details:', frame.body);
        };

        stompClientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
        };
    }, [token]);

    const subscribeToDriver = (driverId: string) => {
        const client = stompClientRef.current;
        if (!client || !client.active) return;

        if (locationSubscriptionRef.current) {
            console.warn("Already subscribed to driver");
            return;
        }

        locationSubscriptionRef.current = client.subscribe(
            `/topic/driver/${driverId}`,
            (message) => {
                const data = JSON.parse(message.body);
                console.log("📢 Driver location:", data);
            }
        );
    };

    const sendLocation = (driverId: string, latitude: number, longitude: number) => {
        const client = stompClientRef.current;
        if (!client || !client.active) return;

        client.publish({
            destination: "/app/driver/location-update",
            body: JSON.stringify({
                driverId,
                latitude,
                longitude,
                timestamp: new Date(),
            }),
        });
        console.log('sendLocation: ', driverId,
                latitude,
                longitude);
    };

    const subscribeToRideRequests = (onMessage: (data: any) => void) => {
        const client = stompClientRef.current;
        if (!client || !client.active) return;

        if (rideRequestSubscriptionRef.current) {
            console.warn("Already subscribed to ride requests");
            return;
        }

        rideRequestSubscriptionRef.current = client.subscribe(
            '/user/queue/new-ride-request',
            (message) => {
                const data = JSON.parse(message.body);
                console.log("📢 Ride request:", data);
                onMessage(data);
            }
        );
        console.log("📢 subscribed to Ride request");
    };

    const subscribeToRideUpdates = (rideId: string, onMessage: (data: Ride) => void) => {
        const client = stompClientRef.current;
        if (!client || !client.active) return;

        if (rideUpdateSubscriptionRef.current) {
            console.warn(`Already subscribed to ride : ${rideId}`);
            return;
        }

        rideUpdateSubscriptionRef.current = client.subscribe(
            `/topic/ride/${rideId}`,
            (message) => {
                const data = JSON.parse(message.body);
                onMessage(data);
            }
        );
        console.log("📢 subscribed to Ride request");
    };

    const unSubscribeToRideUpdates = () => {
        rideUpdateSubscriptionRef.current?.unsubscribe();
        rideUpdateSubscriptionRef.current = null;
    };

    const unsubscribeFromRideRequests = () => {
        rideRequestSubscriptionRef.current?.unsubscribe();
        rideRequestSubscriptionRef.current = null;
    };

    const disconnect = () => {
        stompClientRef.current?.deactivate();
        console.log("🛑 Disconnected");
    };

    return {
        subscribeToDriver,
        subscribeToRideRequests,
        unsubscribeFromRideRequests,
        subscribeToRideUpdates,
        unSubscribeToRideUpdates,
        sendLocation,
        disconnect,
    };
};