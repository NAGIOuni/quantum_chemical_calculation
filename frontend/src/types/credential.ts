export enum AuthMethod {
  PASSWORD = "password",
  SSH_KEY = "ssh_key",
}

export interface ServerCredential {
  id: number;
  host: string;
  port: number;
  username: string;
  auth_method: AuthMethod;
  created_at: string;
}

export interface ServerCredentialCreate {
  host: string;
  port: number;
  username: string;
  auth_method: AuthMethod;
  password?: string;
  ssh_key?: string;
}

export interface ServerCredentialUpdate {
  host?: string;
  port?: number;
  username?: string;
  auth_method?: AuthMethod;
  password?: string;
  ssh_key?: string;
}
