import axios from 'axios';
import type { ChatResponse, UploadResponse } from '../types/api';
import { ensureConversationId, setConversationId } from '../utils/storage';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60_000,
});

export async function sendChatMessage(message: string) {
  const conversation_id = ensureConversationId();

  const { data } = await apiClient.post<ChatResponse>('/chat', {
    conversation_id,
    message,
  });

  if (data.conversation_id) {
    setConversationId(data.conversation_id);
  }

  return data;
}

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/upload', formData);

  return data;
}

export function getDownloadUrl(downloadUrl: string) {
  return `${API_BASE_URL}${downloadUrl}`;
}