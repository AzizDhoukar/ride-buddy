import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const stompClient = new StompJs.Client({
    webSocketFactory: () => new SockJS('http://localhost:9090/ws'),
    reconnectDelay: 5000
});

let locationSubscription: StompJs.StompSubscription | null = null;

const websocket = {
    connect: () => {
        stompClient.onConnect = () => {
            console.log("✅ Connected to WebSocket");
            websocket.subscribeToDriver();
        };

        stompClient.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        stompClient.activate();
    },

    disconnect: () => {
        if (stompClient.active) {
            stompClient.deactivate();
        }
        console.log("🛑 Disconnected from WebSocket");
    },

    subscribeToLocations: () => {
        if (!stompClient.active) {
            console.warn("Cannot subscribe, Stomp client is not active.");
            return;
        }
        if (locationSubscription) {
            console.warn("Already subscribed to locations. Unsubscribe first.");
            return;
        }
        locationSubscription = stompClient.subscribe('/topic/locations', (message) => {
            const data = JSON.parse(message.body);
            console.log("📢 location data" , data);
        });
        console.log("📢 Subscribed to /topic/locations");
    },

    subscribeToDriver: () => {
        if (!stompClient.active) {
            console.warn("Cannot subscribe, Stomp client is not active.");
            return;
        }
        if (locationSubscription) {
            console.warn("Already subscribed to Driver. Unsubscribe first.");
            return;
        }
        locationSubscription = stompClient.subscribe('/topic/driver/789', (message) => {
            const data = JSON.parse(message.body);
            console.log("📢 Driver location data" , data);
        });
        console.log("📢 Subscribed to /topic/driver/789");
    },

    unsubscribeFromLocations: () => {
        if (locationSubscription) {
            locationSubscription.unsubscribe();
            locationSubscription = null;
            console.log("🔕 Unsubscribed from /topic/locations");
        }
    },

    sendLocation: (userId: string, latitude: number, longitude: number) => {
        if (!stompClient.active) {
            console.warn("Cannot send location, Stomp client is not active.");
            return;
        }
        const payload = {
            userId: userId,
            latitude: latitude,
            longitude: longitude
        };
        stompClient.publish({
            destination: "/app/sendLocation",
            body: JSON.stringify(payload)
        });
        console.log("📍 Sent location: " + JSON.stringify(payload));
    }
};

export { websocket };