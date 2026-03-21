import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || '요청 중 오류가 발생했습니다.';
    console.error('API Error:', message);
    return Promise.reject(error);
  },
);

export default apiClient;
