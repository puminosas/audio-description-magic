
// Admin service type definitions

// Types for user activity
export interface UserActivity {
  id: string;
  email: string | null;
  is_registered: boolean;
  last_active: string | null;
  total_generations: number;
  files_count: number;
  registration_date: string | null;
}

export interface UserStatsData {
  registeredUsers: number;
  anonymousUsers: number;
  totalGenerations: number;
  totalFiles: number;
}
