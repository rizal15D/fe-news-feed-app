// Base URL backend NestJS kamu di port 8000
export const API_BASE_URL = `${
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
}/api`;

// Auth
export const API_LOGIN = `${API_BASE_URL}/login`;
export const API_REGISTER = `${API_BASE_URL}/register`;

// Posts
export const API_POSTS = `${API_BASE_URL}/posts`;

// FOLLOW = POST
export const API_FOLLOW = (userId: number) =>
  `${API_BASE_URL}/follow/${userId}`;

// UNFOLLOW = DELETE
export const API_UNFOLLOW = (userId: number) =>
  `${API_BASE_URL}/follow/${userId}`;

// Feed
export const API_FEED = (page: number, limit: number) =>
  `${API_BASE_URL}/feed?page=${page}&limit=${limit}`;

export const API_GET_USERS = `${API_BASE_URL}/user`;
export const API_GET_ME = `${API_BASE_URL}/user/me`;
