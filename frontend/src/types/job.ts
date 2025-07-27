export enum JobStatus {
  QUEUED = "queued",
  RUNNING = "running",
  DONE = "done",
  ERROR = "error",
  CANCELLED = "cancelled",
}

export interface Job {
  id: number;
  molecule_id: number;
  gjf_path: string;
  log_path: string;
  job_type: string;
  status: JobStatus;
  submitted_at: string;
  remote_job_id?: string;
  parent_job_id?: number;
}

export interface JobCreate {
  molecule_id: number;
  gjf_path: string;
  job_type: string;
  parent_job_id?: number;
}

export interface JobUpdate {
  status?: JobStatus;
}

export interface JobLog {
  log_content: string;
  is_complete: boolean;
  system_status: string;
  job_id: number;
  remote_job_id?: string;
}
