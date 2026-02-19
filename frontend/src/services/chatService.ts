import { db, isFirebaseConfigured } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  type: 'text' | 'link';
  createdAt: any;
}

const MOCK_MESSAGES_KEY = 'mock_messages';

// Helper to detect links in text
export const detectLinks = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

// Get mock messages
const getMockMessages = async (): Promise<ChatMessage[]> => {
  try {
    const data = await AsyncStorage.getItem(MOCK_MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setMockMessages = async (messages: ChatMessage[]): Promise<void> => {
  await AsyncStorage.setItem(MOCK_MESSAGES_KEY, JSON.stringify(messages));
};

export const sendMessage = async (
  groupId: string,
  userId: string,
  userName: string,
  userEmail: string,
  content: string
): Promise<ChatMessage> => {
  const type = detectLinks(content) ? 'link' : 'text';
  
  if (!isFirebaseConfigured) {
    const messages = await getMockMessages();
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      groupId,
      userId,
      userName,
      userEmail,
      content,
      type,
      createdAt: new Date().toISOString(),
    };
    await setMockMessages([...messages, newMessage]);
    return newMessage;
  }
  
  const docRef = await addDoc(collection(db, 'groups', groupId, 'messages'), {
    groupId,
    userId,
    userName,
    userEmail,
    content,
    type,
    createdAt: serverTimestamp(),
  });
  
  return {
    id: docRef.id,
    groupId,
    userId,
    userName,
    userEmail,
    content,
    type,
    createdAt: new Date(),
  };
};

export const getMessages = async (groupId: string, messageLimit: number = 50): Promise<ChatMessage[]> => {
  if (!isFirebaseConfigured) {
    const messages = await getMockMessages();
    return messages
      .filter(m => m.groupId === groupId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-messageLimit);
  }
  
  const q = query(
    collection(db, 'groups', groupId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(messageLimit)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || new Date(),
  } as ChatMessage));
};

// Real-time subscription for messages
export const subscribeToMessages = (
  groupId: string,
  callback: (messages: ChatMessage[]) => void,
  messageLimit: number = 50
): Unsubscribe => {
  if (!isFirebaseConfigured) {
    // For mock, poll every 2 seconds
    const interval = setInterval(async () => {
      const messages = await getMessages(groupId, messageLimit);
      callback(messages);
    }, 2000);
    
    // Initial load
    getMessages(groupId, messageLimit).then(callback);
    
    return () => clearInterval(interval);
  }
  
  const q = query(
    collection(db, 'groups', groupId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(messageLimit)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    } as ChatMessage));
    callback(messages);
  });
};
