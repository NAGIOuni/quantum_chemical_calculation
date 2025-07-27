export interface JobBundle {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  calc_settings?: Record<string, any>;
}

export interface JobBundleCreate {
  name: string;
  calc_settings?: Record<string, any>;
}

export interface JobBundleUpdate {
  name?: string;
  calc_settings?: Record<string, any>;
}
