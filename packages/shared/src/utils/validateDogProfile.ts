import { DogProfile } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateDogProfile = (profile: Partial<DogProfile>): ValidationResult => {
  const errors: string[] = [];

  if (!profile.ownerId) {
    errors.push("ownerId is required");
  }

  if (!profile.name || profile.name.trim().length < 2) {
    errors.push("name is required and should be at least 2 characters");
  }

  if (profile.age !== undefined && (profile.age < 0 || profile.age > 40)) {
    errors.push("age must be between 0 and 40 years");
  }

  if (profile.bio && profile.bio.length > 500) {
    errors.push("bio should be under 500 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
