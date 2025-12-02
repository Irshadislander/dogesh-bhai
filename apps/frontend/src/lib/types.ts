export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastSenderId?: string;
  updatedAt?: any;
  unreadCountByUser?: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any;
  seenBy?: string[];
  imageUrl?: string;
}

export type NotificationType = "like" | "comment" | "follow" | "message" | "system";

export interface NotificationDoc {
  id: string;
  type: NotificationType;
  userId: string;
  actorUserId?: string;
  actorDogId?: string;
  actorDisplayName?: string;
  actorDogName?: string;
  actorDogAvatarUrl?: string;
  postId?: string;
  conversationId?: string;
  snippet?: string;
  createdAt?: any;
  isRead: boolean;
}
