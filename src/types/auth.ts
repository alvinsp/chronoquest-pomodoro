export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  lastLoginAt: string;
}

export interface UserAccountBackup {
  user: GoogleUser;
  savedAt: string;
  hero: unknown;
  goals: unknown;
  stats: unknown;
  notes: unknown;
  gamify: unknown;
  timer: unknown;
}
