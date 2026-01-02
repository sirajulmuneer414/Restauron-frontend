import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import notificationSound from '../assets/notification.mp3.wav';
import SockJS from 'sockjs-client';
import useOrderAlert from "./useOrderAlert";

const SOCKET_URL = (import.meta.env.VITE_API_BASE_URL 
    ? import.meta.env.VITE_API_BASE_URL 
    : "http://localhost:8081") + "/ws-restauron";

export const useWebSocket = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef(null);
  const playOrderAlert = useOrderAlert();
  
  // Store subscriptions for dynamic topics (like order status updates)
  const subscriptionsRef = useRef({});

  const user = useSelector((state) => state.userSlice?.user);
  const token = Cookies.get("accessToken");
  const restaurantId = Cookies.get("restaurantId");

  useEffect(() => {
    if (!user || !token) return;

    const client = new Client({
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

        // User-specific notifications
        client.subscribe(`/user/${user.email}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          handleNewNotification(notification);
        });
        
        // Global announcements
        client.subscribe("/topic/announcements", (message) => {
          const announcement = JSON.parse(message.body);
          handleNewNotification({ ...announcement, type: "ANNOUNCEMENT" });
        });

        // Owner-specific alerts
        if (user.role.toLowerCase() === 'owner') {
          client.subscribe("/topic/owners", (message) => {
            const announcement = JSON.parse(message.body);
            handleNewNotification({ ...announcement, type: "OWNER_ALERT" });
          });
        }

        // Restaurant-specific orders (for admin/employee)
        if (restaurantId && (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'employee')) {
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
    const msgWithTime = { ...newMsg, receivedAt: new Date() };
    setNotifications((prev) => [msgWithTime, ...prev]);

    // Play sound
    const audio = new Audio(notificationSound);
    audio.play().catch(err => console.log('Audio play failed:', err));
  };

  const handleNewOrder = (messagePayload) => {
    const type = messagePayload.type || 'NEW_ORDER';

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

    if (type === 'NEW_ORDER' || type === 'ORDER_ALERT') {
      playOrderAlert(`New order received.`);
    }
  };

  // **NEW: Subscribe to specific order status updates**
  const subscribeToOrder = (orderId, callback) => {
    if (!clientRef.current || !isConnected) {
      console.warn('WebSocket not connected, cannot subscribe to order:', orderId);
      return null;
    }

    const topic = `/topic/order/${orderId}`;
    
    // Check if already subscribed
    if (subscriptionsRef.current[topic]) {
      console.log(`Already subscribed to ${topic}`);
      return subscriptionsRef.current[topic];
    }

    console.log(`✅ Subscribing to order updates: ${topic}`);
    
    const subscription = clientRef.current.subscribe(topic, (message) => {
      try {
        const orderUpdate = JSON.parse(message.body);
        console.log('📦 Order update received:', orderUpdate);
        callback(orderUpdate);
      } catch (error) {
        console.error('Error parsing order update:', error);
      }
    });

    subscriptionsRef.current[topic] = subscription;
    return subscription;
  };

  // **NEW: Unsubscribe from order updates**
  const unsubscribeFromOrder = (orderId) => {
    const topic = `/topic/order/${orderId}`;
    const subscription = subscriptionsRef.current[topic];
    
    if (subscription) {
      console.log(`❌ Unsubscribing from ${topic}`);
      subscription.unsubscribe();
      delete subscriptionsRef.current[topic];
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    isConnected,
    notifications,
    clearNotifications,
    subscribeToOrder,
    unsubscribeFromOrder,
  };
};

