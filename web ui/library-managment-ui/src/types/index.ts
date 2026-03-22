export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

// Add other global domains here
export interface User {
  id: string;
  name: string;
  email: string;
}
