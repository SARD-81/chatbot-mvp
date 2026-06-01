import { v4 as uuidv4 } from 'uuid';

import { DEFAULT_SYSTEM_ID, isAppSystemId, type AppSystemId } from '../config/systems';

const STORAGE_AUTH_KEY = 'auth:is_authenticated';
const STORAGE_ACTIVE_SYSTEM_ID_KEY = 'app:active_system_id';
const STORAGE_CONVERSATION_ID_KEY = 'chat:conversation_id';

const KNOWN_SYSTEM_IDS: AppSystemId[] = ['vakav', 'dataYar'];

const storage = window.sessionStorage;

function createConversationId() {
  return `conversation_${uuidv4()}`;
}

function getSystemConversationIdKey(systemId: AppSystemId) {
  return `chat:${systemId}:conversation_id`;
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
  storage.removeItem(STORAGE_ACTIVE_SYSTEM_ID_KEY);

  KNOWN_SYSTEM_IDS.forEach((systemId) => {
    storage.removeItem(getSystemConversationIdKey(systemId));
  });
}

export function getActiveSystemId(): AppSystemId {
  const storedSystemId = storage.getItem(STORAGE_ACTIVE_SYSTEM_ID_KEY);

  if (storedSystemId && isAppSystemId(storedSystemId)) {
    return storedSystemId;
  }

  return DEFAULT_SYSTEM_ID;
}

export function setActiveSystemId(systemId: AppSystemId) {
  storage.setItem(STORAGE_ACTIVE_SYSTEM_ID_KEY, systemId);
}

export function getConversationIdForSystem(systemId: AppSystemId) {
  const conversationId = storage.getItem(getSystemConversationIdKey(systemId));

  if (conversationId) {
    return conversationId;
  }

  if (systemId === DEFAULT_SYSTEM_ID) {
    return storage.getItem(STORAGE_CONVERSATION_ID_KEY);
  }

  return null;
}

export function setConversationIdForSystem(systemId: AppSystemId, conversationId: string) {
  storage.setItem(getSystemConversationIdKey(systemId), conversationId);

  if (systemId === DEFAULT_SYSTEM_ID) {
    storage.setItem(STORAGE_CONVERSATION_ID_KEY, conversationId);
  }
}

export function ensureConversationIdForSystem(systemId: AppSystemId) {
  const existingConversationId = getConversationIdForSystem(systemId);

  if (existingConversationId) {
    return existingConversationId;
  }

  const newConversationId = createConversationId();
  setConversationIdForSystem(systemId, newConversationId);

  return newConversationId;
}

export function getConversationId() {
  return getConversationIdForSystem(DEFAULT_SYSTEM_ID);
}

export function setConversationId(conversationId: string) {
  setConversationIdForSystem(DEFAULT_SYSTEM_ID, conversationId);
}

export function ensureConversationId() {
  return ensureConversationIdForSystem(DEFAULT_SYSTEM_ID);
}
