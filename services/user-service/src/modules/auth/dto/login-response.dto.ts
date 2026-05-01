export interface LoginResponse {
  token: string;
  user: {
    email: string;
    username: string;
    password_hashed: undefined;
  };
}
