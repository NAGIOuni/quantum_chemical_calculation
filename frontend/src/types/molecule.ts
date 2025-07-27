export interface Molecule {
  id: number;
  name: string;
  charge: number;
  multiplicity: number;
  structure_xyz: string;
  bundle_id: number;
  latest_job_id?: string;
}

export interface MoleculeCreate {
  name: string;
  charge: number;
  multiplicity: number;
  structure_xyz: string;
  bundle_id: number;
}

export interface MoleculeUpdate {
  name?: string;
  charge?: number;
  multiplicity?: number;
  structure_xyz?: string;
}
