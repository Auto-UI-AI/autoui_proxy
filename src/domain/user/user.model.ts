export type AuthProvider = "google" | "github";
export type UserStatus = "active" | "disabled" | "deleted";

export type UserEntity = {
  _id?: any;

  displayName?: string;
  avatarUrl?: string;

  email: string;              
  emailVerifiedAt?: Date | null;
  passwordHash?: string;      
  passwordUpdatedAt?: Date | null;

  oauth?: {
    google?: {
      subject: string;          // Google "sub" (stable unique id)
      email?: string;
      linkedAt: Date;
    };
    github?: {
      subject: string;          // GitHub user id (stringified)
      username?: string;
      email?: string;
      linkedAt: Date;
    };
  };

  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;  
};