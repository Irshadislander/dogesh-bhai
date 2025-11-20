import axios from "axios";
import type { DogProfile, CommunityPost } from "@visway/shared";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchDogs = async (): Promise<DogProfile[]> => {
  const { data } = await apiClient.get<DogProfile[]>("/dogs");
  return data;
};

export const createDogProfile = async (payload: Partial<DogProfile>): Promise<DogProfile> => {
  const { data } = await apiClient.post<DogProfile>("/dogs", payload);
  return data;
};

export const fetchCommunityPosts = async (): Promise<CommunityPost[]> => {
  const { data } = await apiClient.get<CommunityPost[]>("/community");
  return data;
};

export const likePost = async (id: string): Promise<CommunityPost> => {
  const { data } = await apiClient.post<CommunityPost>(`/community/${id}/like`);
  return data;
};

export const loginWithToken = async (idToken: string) => {
  const { data } = await apiClient.post("/auth/login", { idToken });
  return data;
};

export default apiClient;
