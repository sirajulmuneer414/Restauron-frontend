import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux"; // Assuming you use Redux for user state
import Cookies from "js-cookie";
import notificationSound from '../assets/notification.mp3.wav';
// Import SockJS
import SockJS from 'sockjs-client';
import useOrderAlert from "./useOrderAlert";

// Change URL to http (SockJS uses http to handshake)
const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL 
    : "http://localhost:8081") + "/ws-restauron";


export const useWebSocket = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);
  const playOrderAlert = useOrderAlert();

  const user = useSelector((state) => state.userSlice?.user);
  const token = Cookies.get("accessToken");
  const restaurantId = Cookies.get("restaurantId");

  useEffect(() => {
    if (!user || !token) return;

    // Create the client
    const client = new Client({
      // 1. Use webSocketFactory for SockJS
      webSocketFactory: () => new SockJS(SOCKET_URL), 
      
      connectHeaders: {
        Authorization: `Bearer ${token}`, 
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("✅ WebSocket Connected");
        setIsConnected(true);

        // ... subscriptions remain the same ...
        client.subscribe(`/user/${user.email}/queue/notifications`, (message) => {
             const notification = JSON.parse(message.body);
             handleNewNotification(notification);
        });
        
        client.subscribe("/topic/announcements", (message) => {
             const announcement = JSON.parse(message.body);
             handleNewNotification({ ...announcement, type: "ANNOUNCEMENT" });
        });

        if(user.role.toLowerCase() === 'owner'){
        client.subscribe("/topic/owners", (message) => {
             const announcement = JSON.parse(message.body);
             handleNewNotification({ ...announcement, type: "OWNER_ALERT" });
        });
      }

           // 5. Subscribe to New Orders (Restaurant Specific)
            if (restaurantId && (user.role.toLowerCase() == 'admin'|| user.role.toLowerCase() == 'employee')) {
                console.log(`Subscribing to orders for Restaurant: ${restaurantId}`);
                client.subscribe(`/topic/restaurant/${restaurantId}/orders`, (message) => {
                    const orderData = JSON.parse(message.body);
                    handleNewOrder(orderData);
                });
              }


      },

      onDisconnect: () => {
        console.log("❌ WebSocket Disconnected");
        setIsConnected(false);
      },

      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [user, token, restaurantId]);

 
  const handleNewNotification = (newMsg) => {
    // Add timestamp if missing
    const msgWithTime = { ...newMsg, receivedAt: new Date() };

    setNotifications((prev) => [msgWithTime, ...prev]);

    // Sound here
    const audio = new Audio(notificationSound);
    audio.play();
  };

      const handleNewOrder = (messagePayload) => {
        // 1. Determine the type (Default to 'NEW_ORDER' if backend didn't send one)
        const type = messagePayload.type || 'NEW_ORDER';

        // 2. Construct the notification object
        const notification = {
            ...messagePayload,
            type: type, 
            title: type === 'REFRESH_ORDERS' ? 'Update Received' : 'New Order Received!',
            message: type === 'REFRESH_ORDERS' 
                ? 'Syncing data...' 
                : `Order #${messagePayload.orderId || '?'} - Table ${messagePayload.tableNumber || '?'}`,
            receivedAt: new Date()
        };

        setNotifications((prev) => [notification, ...prev]);

        // 3. Play Sound ONLY for actual New Orders (ignore silent refreshes)
        if (type === 'NEW_ORDER' || type === 'ORDER_ALERT') {
             playOrderAlert(`New order received.`);
        }
    };


  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    isConnected,
    notifications,
    clearNotifications,
  };
};
