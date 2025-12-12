"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Bed, BedStatus, Patient, BedStats } from '@/types/bed';
import { bedAPI } from '@/lib/api';

interface BedContextType {
  beds: Bed[];
  stats: BedStats;
  loading: boolean;
  error: string | null;
  assignBed: (bedId: number, patient: Patient, dates?: { assignedAt?: string; releasedAt?: string }, nurseId?: number) => Promise<void>;
  releaseBed: (bedId: number) => Promise<void>;
  setRepair: (bedId: number, note?: string, dates?: { repairStartAt?: string; repairEndAt?: string }) => Promise<void>;
  setAvailable: (bedId: number) => Promise<void>;
  getBedById: (bedId: number) => Bed | undefined;
  getOccupancyDuration: (bedId: number) => string;
  filterBeds: (filters: { status?: BedStatus; floor?: number; room?: string }) => Bed[];
  refreshBeds: () => Promise<void>;
}

const BedContext = createContext<BedContextType | undefined>(undefined);

export const BedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load beds from API
  const loadBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bedAPI.getAllBeds();
      
      // Convert date strings to Date objects
      const formattedBeds = data.map(bed => ({
        ...bed,
        assignedAt: bed.assignedAt ? new Date(bed.assignedAt) : undefined,
        releasedAt: bed.releasedAt ? new Date(bed.releasedAt) : undefined,
        repairStartAt: bed.repairStartAt ? new Date(bed.repairStartAt) : undefined,
        repairEndAt: bed.repairEndAt ? new Date(bed.repairEndAt) : undefined,
      }));
      
      setBeds(formattedBeds);
    } catch (err) {
      console.error('Error loading beds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load beds');
      // Fallback to empty array on error
      setBeds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load beds on mount
  useEffect(() => {
    loadBeds();
  }, [loadBeds]);

  const assignBed = useCallback(async (bedId: number, patient: Patient, dates?: { assignedAt?: string; releasedAt?: string }, nurseId?: number) => {
    try {
      const updatedBed = await bedAPI.assignBed(bedId, {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        medicalRecord: patient.medicalRecord,
      }, dates, nurseId);

      // Update local state
      setBeds(prev => prev.map(bed => 
        bed.id === bedId 
          ? {
              ...updatedBed,
              assignedAt: updatedBed.assignedAt ? new Date(updatedBed.assignedAt) : undefined,
              releasedAt: updatedBed.releasedAt ? new Date(updatedBed.releasedAt) : undefined,
              nurse: updatedBed.nurse,
            }
          : bed
      ));
    } catch (err) {
      console.error('Error assigning bed:', err);
      throw err;
    }
  }, []);

  const releaseBed = useCallback(async (bedId: number) => {
    try {
      const updatedBed = await bedAPI.releaseBed(bedId);

      setBeds(prev => prev.map(bed => 
        bed.id === bedId 
          ? {
              ...updatedBed,
              assignedAt: undefined,
            }
          : bed
      ));
    } catch (err) {
      console.error('Error releasing bed:', err);
      throw err;
    }
  }, []);

  const setRepair = useCallback(async (bedId: number, note?: string, dates?: { repairStartAt?: string; repairEndAt?: string }) => {
    try {
      const updatedBed = await bedAPI.setRepair(bedId, note, dates);

      setBeds(prev => prev.map(bed => 
        bed.id === bedId 
          ? {
              ...updatedBed,
              assignedAt: undefined,
              releasedAt: undefined,
              repairStartAt: updatedBed.repairStartAt ? new Date(updatedBed.repairStartAt) : undefined,
              repairEndAt: updatedBed.repairEndAt ? new Date(updatedBed.repairEndAt) : undefined,
            }
          : bed
      ));
    } catch (err) {
      console.error('Error setting bed to repair:', err);
      throw err;
    }
  }, []);

  const setAvailable = useCallback(async (bedId: number) => {
    try {
      const updatedBed = await bedAPI.setAvailable(bedId);

      setBeds(prev => prev.map(bed => 
        bed.id === bedId 
          ? {
              ...updatedBed,
              assignedAt: undefined,
            }
          : bed
      ));
    } catch (err) {
      console.error('Error setting bed to available:', err);
      throw err;
    }
  }, []);

  const getBedById = useCallback((bedId: number) => {
    return beds.find(bed => bed.id === bedId);
  }, [beds]);

  const getOccupancyDuration = useCallback((bedId: number): string => {
    const bed = beds.find(b => b.id === bedId);
    if (!bed || !bed.assignedAt) return '';

    const now = new Date();
    const assigned = bed.assignedAt instanceof Date ? bed.assignedAt : new Date(bed.assignedAt);
    const diffMs = now.getTime() - assigned.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days} hari ${hours} jam`;
    } else if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    } else {
      return `${minutes} menit`;
    }
  }, [beds]);

  const filterBeds = useCallback((filters: { status?: BedStatus; floor?: number; room?: string }) => {
    return beds.filter(bed => {
      if (filters.status && bed.status !== filters.status) return false;
      if (filters.floor && bed.floor !== filters.floor) return false;
      if (filters.room && bed.room !== filters.room) return false;
      return true;
    });
  }, [beds]);

  const refreshBeds = useCallback(async () => {
    await loadBeds();
  }, [loadBeds]);

  const stats: BedStats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    repair: beds.filter(b => b.status === 'repair').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length,
  };

  return (
    <BedContext.Provider value={{
      beds,
      stats,
      loading,
      error,
      assignBed,
      releaseBed,
      setRepair,
      setAvailable,
      getBedById,
      getOccupancyDuration,
      filterBeds,
      refreshBeds,
    }}>
      {children}
    </BedContext.Provider>
  );
};

export const useBeds = () => {
  const context = useContext(BedContext);
  if (!context) {
    throw new Error('useBeds must be used within BedProvider');
  }
  return context;
};
