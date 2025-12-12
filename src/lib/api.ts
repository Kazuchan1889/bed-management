const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Patient {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female';
  medicalRecord?: string;
}

export interface Bed {
  id: number;
  status: 'available' | 'occupied' | 'repair' | 'maintenance';
  patient?: Patient;
  assignedAt?: string;
  releasedAt?: string;
  repairNote?: string;
  repairStartAt?: string;
  repairEndAt?: string;
  room: string;
  floor: number;
}

export interface BedStats {
  total: number;
  available: number;
  occupied: number;
  repair: number;
  maintenance: number;
}

class BedAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllBeds(filters?: { floor?: number; room?: string; status?: string }): Promise<Bed[]> {
    const params = new URLSearchParams();
    if (filters?.floor) params.append('floor', filters.floor.toString());
    if (filters?.room) params.append('room', filters.room);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    return this.request<Bed[]>(`/beds${query ? `?${query}` : ''}`);
  }

  async getBedById(id: number): Promise<Bed> {
    return this.request<Bed>(`/beds/${id}`);
  }

  async assignBed(bedId: number, patient: Omit<Patient, 'id'>, dates?: { assignedAt?: string; releasedAt?: string }, nurseId?: number): Promise<Bed> {
    return this.request<Bed>(`/beds/${bedId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ ...patient, ...dates, nurseId }),
    });
  }

  async releaseBed(bedId: number): Promise<Bed> {
    return this.request<Bed>(`/beds/${bedId}/release`, {
      method: 'POST',
    });
  }

  async setRepair(bedId: number, repairNote?: string, dates?: { repairStartAt?: string; repairEndAt?: string }): Promise<Bed> {
    return this.request<Bed>(`/beds/${bedId}/repair`, {
      method: 'POST',
      body: JSON.stringify({ repairNote, ...dates }),
    });
  }

  async setAvailable(bedId: number): Promise<Bed> {
    return this.request<Bed>(`/beds/${bedId}/available`, {
      method: 'POST',
    });
  }

  async getStats(floor?: number): Promise<BedStats> {
    const params = new URLSearchParams();
    if (floor) params.append('floor', floor.toString());

    const query = params.toString();
    return this.request<BedStats>(`/beds/stats/overview${query ? `?${query}` : ''}`);
  }
}

export const bedAPI = new BedAPI();

// Nurse API
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

class NurseAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAllNurses(status?: 'active' | 'inactive'): Promise<Nurse[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);

    const query = params.toString();
    return this.request<Nurse[]>(`/nurses${query ? `?${query}` : ''}`);
  }

  async getNurseById(id: number): Promise<Nurse & { assignments?: NurseAssignment[] }> {
    return this.request<Nurse & { assignments?: NurseAssignment[] }>(`/nurses/${id}`);
  }

  async createNurse(nurse: Omit<Nurse, 'id' | 'createdAt' | 'updatedAt'>): Promise<Nurse> {
    return this.request<Nurse>('/nurses', {
      method: 'POST',
      body: JSON.stringify(nurse),
    });
  }

  async updateNurse(id: number, nurse: Partial<Omit<Nurse, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Nurse> {
    return this.request<Nurse>(`/nurses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(nurse),
    });
  }

  async deleteNurse(id: number): Promise<void> {
    return this.request<void>(`/nurses/${id}`, {
      method: 'DELETE',
    });
  }

  async getNurseAssignments(nurseId: number, active?: boolean): Promise<NurseAssignment[]> {
    const params = new URLSearchParams();
    if (active !== undefined) params.append('active', active.toString());

    const query = params.toString();
    return this.request<NurseAssignment[]>(`/nurses/${nurseId}/assignments${query ? `?${query}` : ''}`);
  }

  async getAllAssignments(filters?: { nurseId?: number; bedId?: number; active?: boolean }): Promise<NurseAssignment[]> {
    const params = new URLSearchParams();
    if (filters?.nurseId) params.append('nurseId', filters.nurseId.toString());
    if (filters?.bedId) params.append('bedId', filters.bedId.toString());
    if (filters?.active !== undefined) params.append('active', filters.active.toString());

    const query = params.toString();
    return this.request<NurseAssignment[]>(`/nurse-assignments${query ? `?${query}` : ''}`);
  }

  async createAssignment(assignment: Omit<NurseAssignment, 'id' | 'createdAt' | 'updatedAt' | 'nurse' | 'bed'>): Promise<NurseAssignment> {
    return this.request<NurseAssignment>('/nurse-assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  async releaseAssignment(id: number, releasedAt?: string): Promise<NurseAssignment> {
    return this.request<NurseAssignment>(`/nurse-assignments/${id}/release`, {
      method: 'PUT',
      body: JSON.stringify({ releasedAt }),
    });
  }

  async deleteAssignment(id: number): Promise<void> {
    return this.request<void>(`/nurse-assignments/${id}`, {
      method: 'DELETE',
    });
  }
}

export const nurseAPI = new NurseAPI();

