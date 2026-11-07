import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BAKEND_URL || "http://localhost:5000",
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const signup = (data) => API.post("/api/auth/signup", data);
export const login = (data) => API.post("/api/auth/login", data);
export const getMe = () => API.get("/api/auth/me");

// Post endpoints
export const getPosts = (page = 1, limit = 10) =>
  API.get(`/posts?page=${page}&limit=${limit}`);

export const createPost = (formData) =>
  API.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const likePost = (id) => API.put(`/posts/${id}/like`);

export const commentOnPost = (id, text) =>
  API.post(`/posts/${id}/comment`, { text });

export const deletePost = (id) => API.delete(`/posts/${id}`);

export default API;
