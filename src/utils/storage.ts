import { v4 as uuidv4 } from 'uuid';

const STORAGE_AUTH_KEY = 'auth:is_authenticated';
const STORAGE_CONVERSATION_ID_KEY = 'chat:conversation_id';

const storage = window.sessionStorage;

function createConversationId() {
  return `conversation_${uuidv4()}`;
}

export function isAuthenticated() {
  return storage.getItem(STORAGE_AUTH_KEY) === 'true';
}

export function login(username: string, password: string) {
  const isValid = username === 'admin' && password === '123';

  if (!isValid) {
    return false;
  }

  storage.setItem(STORAGE_AUTH_KEY, 'true');
  ensureConversationId();

  return true;
}

export function logout() {
  storage.removeItem(STORAGE_AUTH_KEY);
  storage.removeItem(STORAGE_CONVERSATION_ID_KEY);
}

export function getConversationId() {
  return storage.getItem(STORAGE_CONVERSATION_ID_KEY);
}

export function setConversationId(conversationId: string) {
  storage.setItem(STORAGE_CONVERSATION_ID_KEY, conversationId);
}

export function ensureConversationId() {
  const existingConversationId = getConversationId();

  if (existingConversationId) {
    return existingConversationId;
  }

  const newConversationId = createConversationId();
  setConversationId(newConversationId);

  return newConversationId;
}