export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DogProfile {
  id: string;
  ownerId: string;
  name: string;
  breed?: string;
  age?: number;
  bio?: string;
  avatarUrl?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  dogId?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  likes?: number;
}
