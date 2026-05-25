import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
const subscribers = new Map();

/**
 * Connects to the STOMP WebSocket broker at `/ws`.
 */
export const connectWebSocket = (onConnected, onDisconnected) => {
  if (stompClient && stompClient.connected) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: function (str) {
      // Mute verbose debug logging
    }
  });

  stompClient.onConnect = (frame) => {
    console.log('STOMP Connected successfully:', frame);
    if (onConnected) onConnected();

    // Restore active subscriptions on reconnect
    subscribers.forEach((callback, topic) => {
      stompClient.subscribe(topic, (message) => {
        callback(JSON.parse(message.body));
      });
    });
  };

  stompClient.onWebSocketError = (error) => {
    console.error('STOMP Socket error:', error);
    if (onDisconnected) onDisconnected();
  };

  stompClient.onWebSocketClose = () => {
    if (onDisconnected) onDisconnected();
  };

  stompClient.activate();
};

/**
 * Subscribes to a topic. Restores subscription on reconnect automatically.
 */
export const subscribeToTopic = (topic, callback) => {
  subscribers.set(topic, callback);
  
  if (stompClient && stompClient.connected) {
    const sub = stompClient.subscribe(topic, (message) => {
      callback(JSON.parse(message.body));
    });
    return sub;
  }
  return null;
};

/**
 * Unsubscribes from a topic.
 */
export const unsubscribeFromTopic = (topic) => {
  subscribers.delete(topic);
};

/**
 * Disconnects the active STOMP client session.
 */
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log('STOMP Client disconnected.');
  }
};
