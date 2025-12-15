export type NavigationItem = 'dashboard' | 'inbox' | 'finance' | 'social' | 'vault' | 'contacts';

export interface User {
  id: string;
  name: string;
  avatar: string;
  ltv: number;
  platform: 'of' | 'telegram' | 'insta';
  status: 'online' | 'offline';
  isWhale: boolean;
  notes?: string;
  tags: string[];
  purchasedAssets: string[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'user';
  timestamp: string;
  attachments?: string[];
}

export interface Conversation {
  id: string;
  userId: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  source: string;
  type: 'subscription' | 'tip' | 'ppv';
}

export interface Asset {
  id: string;
  url: string;
  type: 'image' | 'video';
  tags: string[];
  price: number;
  sales: number;
  revenue: number;
}
