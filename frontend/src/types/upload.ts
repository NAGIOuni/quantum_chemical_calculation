export interface GJFUploadResult {
  name: string;
  charge: number;
  multiplicity: number;
  structure_xyz: string;
  status: string;
  error_message?: string;
}
