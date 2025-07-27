import {
  LoginCredentials,
  Token,
  User,
  UserCreate,
  UserUpdate,
  JobBundle,
  JobBundleCreate,
  JobBundleUpdate,
  Molecule,
  MoleculeCreate,
  MoleculeUpdate,
  Job,
  JobCreate,
  JobUpdate,
  JobLog,
  ServerCredential,
  ServerCredentialCreate,
  ServerCredentialUpdate,
  GJFUploadResult,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<Token> {
    const formData = new FormData();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  }

  async getMe(): Promise<{ username: string }> {
    return this.request("/auth/me");
  }

  // User endpoints
  async registerUser(userData: UserCreate): Promise<User> {
    return this.request("/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request("/users/me");
  }

  async updateCurrentUser(userData: UserUpdate): Promise<User> {
    return this.request("/users/me", {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }

  async deleteCurrentUser(): Promise<void> {
    return this.request("/users/me", {
      method: "DELETE",
    });
  }

  // Job Bundle endpoints
  async createJobBundle(data: JobBundleCreate): Promise<JobBundle> {
    return this.request("/bundles/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getJobBundles(): Promise<JobBundle[]> {
    return this.request("/bundles/");
  }

  async getJobBundle(id: number): Promise<JobBundle> {
    return this.request(`/bundles/${id}`);
  }

  async updateJobBundle(id: number, data: JobBundleUpdate): Promise<JobBundle> {
    return this.request(`/bundles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteJobBundle(id: number): Promise<void> {
    return this.request(`/bundles/${id}`, {
      method: "DELETE",
    });
  }

  // Molecule endpoints
  async createMolecule(data: MoleculeCreate): Promise<Molecule> {
    return this.request("/molecules/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMolecules(): Promise<Molecule[]> {
    return this.request("/molecules/");
  }

  async getMolecule(id: number): Promise<Molecule> {
    return this.request(`/molecules/${id}`);
  }

  async updateMolecule(id: number, data: MoleculeUpdate): Promise<Molecule> {
    return this.request(`/molecules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMolecule(id: number): Promise<void> {
    return this.request(`/molecules/${id}`, {
      method: "DELETE",
    });
  }

  // Job endpoints
  async createJob(data: JobCreate): Promise<Job> {
    return this.request("/jobs/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getJobs(): Promise<Job[]> {
    return this.request("/jobs/");
  }

  async getJob(id: number): Promise<Job> {
    return this.request(`/jobs/${id}`);
  }

  async updateJob(id: number, data: JobUpdate): Promise<Job> {
    return this.request(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: number): Promise<void> {
    return this.request(`/jobs/${id}`, {
      method: "DELETE",
    });
  }

  async cancelJob(id: number): Promise<{ result: string }> {
    return this.request(`/jobs/${id}/cancel`, {
      method: "POST",
    });
  }

  async relaunchJob(id: number): Promise<Job> {
    return this.request(`/jobs/${id}/relaunch`, {
      method: "POST",
    });
  }

  async getJobLog(id: number): Promise<JobLog> {
    return this.request(`/jobs/${id}/log`);
  }

  // Server Credential endpoints
  async createServerCredential(
    data: ServerCredentialCreate
  ): Promise<ServerCredential> {
    return this.request("/credentials/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getServerCredentials(): Promise<ServerCredential[]> {
    return this.request("/credentials/");
  }

  async getServerCredential(id: number): Promise<ServerCredential> {
    return this.request(`/credentials/${id}`);
  }

  async updateServerCredential(
    id: number,
    data: ServerCredentialUpdate
  ): Promise<ServerCredential> {
    return this.request(`/credentials/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteServerCredential(id: number): Promise<void> {
    return this.request(`/credentials/${id}`, {
      method: "DELETE",
    });
  }

  async testConnection(
    data: ServerCredentialCreate
  ): Promise<{ result: string }> {
    return this.request("/credentials/test-connection", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // File upload
  async uploadGJFFiles(
    bundleId: number,
    files: File[]
  ): Promise<GJFUploadResult[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/bundles/${bundleId}/upload-gjf`,
      {
        method: "POST",
        headers,
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
