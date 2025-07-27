export interface User {
  id: number;
  username: string;
  role: string;
  local_base_dir: string;
  remote_base_dir: string;
  created_at: string;
}

export interface UserCreate {
  username: string;
  password: string;
  role?: string;
  local_base_dir: string;
  remote_base_dir: string;
}

export interface UserUpdate {
  local_base_dir?: string;
  remote_base_dir?: string;
}
