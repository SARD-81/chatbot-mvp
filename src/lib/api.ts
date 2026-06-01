import axios from 'axios';
import type { AppSystemConfig } from '../config/systems';
import { getDefaultSystem } from '../config/systems';
import type { ChatResponse, UploadResponse } from '../types/api';
import {
  ensureConversationIdForSystem,
  setConversationIdForSystem,
} from '../utils/storage';

export const API_BASE_URL = getDefaultSystem().apiBaseUrl;

function createApiClient(apiBaseUrl: string) {
  return axios.create({
    baseURL: apiBaseUrl,
    timeout: 60_000,
  });
}

export const apiClient = createApiClient(API_BASE_URL);

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function joinBaseUrlAndPath(apiBaseUrl: string, path: string) {
  if (isAbsoluteUrl(path)) {
    return path;
  }

  const normalizedBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');

  return `${normalizedBaseUrl}/${normalizedPath}`;
}

export function getDownloadUrl(downloadUrl: string, apiBaseUrl = API_BASE_URL) {
  if (isAbsoluteUrl(downloadUrl)) {
    return downloadUrl;
  }

  return joinBaseUrlAndPath(apiBaseUrl, downloadUrl);
}

function normalizeChatResponseDownloadUrl(
  response: ChatResponse,
  apiBaseUrl: string
): ChatResponse {
  if (!response.metadata?.download_url) {
    return response;
  }

  return {
    ...response,
    metadata: {
      ...response.metadata,
      download_url: getDownloadUrl(response.metadata.download_url, apiBaseUrl),
    },
  };
}

export async function sendChatMessage(
  message: string,
  system?: AppSystemConfig
) {
  const targetSystem = system ?? getDefaultSystem();
  const apiClient = createApiClient(targetSystem.apiBaseUrl);
  const conversation_id = ensureConversationIdForSystem(targetSystem.id);

  const { data } = await apiClient.post<ChatResponse>('/chat', {
    conversation_id,
    message,
  });

  if (data.conversation_id) {
    setConversationIdForSystem(targetSystem.id, data.conversation_id);
  }

  return normalizeChatResponseDownloadUrl(data, targetSystem.apiBaseUrl);
}

export async function uploadDataset(file: File, system?: AppSystemConfig) {
  const targetSystem = system ?? getDefaultSystem();
  const apiClient = createApiClient(targetSystem.apiBaseUrl);
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/upload', formData);

  return data;
}
