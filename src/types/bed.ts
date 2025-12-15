// Type definitions for Bed Management System

export type BedStatus = 'available' | 'occupied' | 'repair' | 'maintenance';

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female';
  medicalRecord?: string;
}

export interface Bed {
  id: number;
  status: BedStatus;
  patient?: Patient;
  assignedAt?: Date | string;
  releasedAt?: Date | string;
  repairNote?: string;
  repairStartAt?: Date | string;
  repairEndAt?: Date | string;
  room: string;
  floor: number;
  nurse?: {
    id: number;
    name: string;
    employeeId?: string;
  };
}

export interface BedStats {
  total: number;
  available: number;
  occupied: number;
  repair: number;
  maintenance: number;
}

export interface BedFilter {
  status?: BedStatus;
  floor?: number;
  room?: string;
  search?: string;
}

export interface Nurse {
  id: number;
  name: string;
  employeeId?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface NurseAssignment {
  id: number;
  nurseId: number;
  bedId: number;
  assignedAt: string;
  releasedAt?: string;
  notes?: string;
  nurse?: Nurse;
  bed?: Bed;
  createdAt?: string;
  updatedAt?: string;
}

export interface BedHistory {
  id: number;
  bedId: number;
  bed: {
    id: number;
    room: string;
    floor: number;
  };
  action: 'assigned' | 'released' | 'repair' | 'available';
  patient?: Patient | null;
  nurse?: {
    id: number;
    name: string;
    employeeId?: string;
  } | null;
  assignedAt?: string | null;
  releasedAt?: string | null;
  repairNote?: string | null;
  createdAt: string;
}

