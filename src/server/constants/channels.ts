/**
 * Constants for notification channels used in the StoreGo platform
 */
export const NOTIFICATION_CHANNELS = {
  // Store-related notification channels
  STORE: "store", // For store-wide notifications

  // User-related notification channels
  USER: "user", // For user-specific notifications

  // Product-related notification channels
  PRODUCT: "product", // For product updates

  // Order-related notification channels
  ORDER: "order", // For order status updates

  // Chat-related notification channels
  CHAT: "chat", // For chat messages
} as const;
