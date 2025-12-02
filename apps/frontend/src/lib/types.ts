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
