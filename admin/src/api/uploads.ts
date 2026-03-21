import { apiClient } from './client';

export interface UploadResponse {
  image_url: string;
  thumbnail_url: string | null;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
