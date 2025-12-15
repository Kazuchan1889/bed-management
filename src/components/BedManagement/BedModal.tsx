"use client";

import React, { useState, useEffect } from 'react';
import { Bed, Patient } from '@/types/bed';
import { useBeds } from '@/context/BedContext';
import { nurseAPI, Nurse } from '@/lib/api';

interface BedModalProps {
  bed: Bed | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BedModal: React.FC<BedModalProps> = ({ bed, isOpen, onClose }) => {
  const { assignBed, releaseBed, setRepair, setAvailable, getOccupancyDuration, refreshBeds } = useBeds();
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState<'male' | 'female'>('male');
  const [medicalRecord, setMedicalRecord] = useState('');
  const [repairNote, setRepairNote] = useState('');
  const [assignedAt, setAssignedAt] = useState('');
  const [releasedAt, setReleasedAt] = useState('');
  const [repairStartAt, setRepairStartAt] = useState('');
  const [repairEndAt, setRepairEndAt] = useState('');
  const [action, setAction] = useState<'assign' | 'repair' | 'release' | null>(null);
  const [loading, setLoading] = useState(false);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [selectedNurseId, setSelectedNurseId] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Load nurses when modal opens
    const loadNurses = async () => {
      try {
        const data = await nurseAPI.getAllNurses('active');
        setNurses(data);
      } catch (error) {
        console.error('Error loading nurses:', error);
      }
    };
    
    if (isOpen) {
      loadNurses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (bed) {
      if (bed.patient) {
        setPatientName(bed.patient.name);
        setPatientAge(bed.patient.age?.toString() || '');
        setPatientGender(bed.patient.gender || 'male');
        setMedicalRecord(bed.patient.medicalRecord || '');
      } else {
        setPatientName('');
        setPatientAge('');
        setPatientGender('male');
        setMedicalRecord('');
      }
      
      // Set selected nurse if bed has a nurse assigned
      if (bed.nurse) {
        setSelectedNurseId(bed.nurse.id);
      } else {
        setSelectedNurseId(undefined);
      }
      if (bed.repairNote) {
        setRepairNote(bed.repairNote);
      } else {
        setRepairNote('');
      }
      
      // Set tanggal dari bed jika ada
      if (bed.assignedAt) {
        const assignedDate = bed.assignedAt instanceof Date ? bed.assignedAt : new Date(bed.assignedAt);
        setAssignedAt(assignedDate.toISOString().split('T')[0]);
      } else {
        setAssignedAt('');
      }
      
      if (bed.releasedAt) {
        const releasedDate = bed.releasedAt instanceof Date ? bed.releasedAt : new Date(bed.releasedAt);
        setReleasedAt(releasedDate.toISOString().split('T')[0]);
      } else {
        setReleasedAt('');
      }
      
      if (bed.repairStartAt) {
        const repairStartDate = bed.repairStartAt instanceof Date ? bed.repairStartAt : new Date(bed.repairStartAt);
        setRepairStartAt(repairStartDate.toISOString().split('T')[0]);
      } else {
        setRepairStartAt('');
      }
      
      if (bed.repairEndAt) {
        const repairEndDate = bed.repairEndAt instanceof Date ? bed.repairEndAt : new Date(bed.repairEndAt);
        setRepairEndAt(repairEndDate.toISOString().split('T')[0]);
      } else {
        setRepairEndAt('');
      }
      
      setAction(null);
    }
  }, [bed]);

  if (!isOpen || !bed) return null;

  const handleAssign = async () => {
    if (!patientName.trim()) {
      alert('Nama pasien harus diisi');
      return;
    }

    // Validate dates
    if (releasedAt && assignedAt && new Date(releasedAt) <= new Date(assignedAt)) {
      alert('Tanggal selesai harus setelah tanggal mulai');
      return;
    }

    try {
      setLoading(true);
      const patient: Patient = {
        id: `PAT-${Date.now()}`,
        name: patientName,
        age: patientAge ? parseInt(patientAge) : undefined,
        gender: patientGender,
        medicalRecord: medicalRecord || undefined,
      };

      const dates = {
        assignedAt: assignedAt || undefined,
        releasedAt: releasedAt || undefined,
      };

      // Only include nurseId for floors 2 and 3
      const nurseId = (bed.floor === 2 || bed.floor === 3) ? selectedNurseId : undefined;

      await assignBed(bed.id, patient, dates, nurseId);
      await refreshBeds();
      onClose();
      resetForm();
    } catch (error) {
      alert('Gagal mengassign pasien: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRepair = async () => {
    // Validate dates
    if (repairEndAt && repairStartAt && new Date(repairEndAt) <= new Date(repairStartAt)) {
      alert('Tanggal selesai perbaikan harus setelah tanggal mulai');
      return;
    }

    try {
      setLoading(true);
      const dates = {
        repairStartAt: repairStartAt || undefined,
        repairEndAt: repairEndAt || undefined,
      };
      await setRepair(bed.id, repairNote || undefined, dates);
      await refreshBeds();
      onClose();
      resetForm();
    } catch (error) {
      alert('Gagal menandai perbaikan: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    if (confirm('Yakin ingin melepaskan kasur ini? Pasien akan dilepaskan dari kasur.')) {
      try {
        setLoading(true);
        await releaseBed(bed.id);
        await refreshBeds();
        onClose();
        resetForm();
      } catch (error) {
        alert('Gagal melepaskan kasur: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSetAvailable = async () => {
    if (confirm('Yakin perbaikan sudah selesai? Kasur akan dikembalikan ke status kosong.')) {
      try {
        setLoading(true);
        await setAvailable(bed.id);
        await refreshBeds();
        onClose();
        resetForm();
      } catch (error) {
        alert('Gagal mengembalikan kasur: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setPatientName('');
    setPatientAge('');
    setPatientGender('male');
    setMedicalRecord('');
    setRepairNote('');
    setAssignedAt('');
    setReleasedAt('');
    setRepairStartAt('');
    setRepairEndAt('');
    setAction(null);
    setSelectedNurseId(undefined);
  };

  const occupancyDuration = bed.status === 'occupied' ? getOccupancyDuration(bed.id) : '';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'occupied':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'repair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Kosong';
      case 'occupied':
        return 'Terisi';
      case 'repair':
        return 'Sedang Diperbaiki';
      default:
        return status;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-2 md:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 max-w-md w-full h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Kelola Kasur #{bed.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-3 sm:mb-4">
          <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full border-2 ${getStatusColor(bed.status)}`}>
            <span className="text-xs sm:text-sm font-semibold">{getStatusText(bed.status)}</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            <strong>Lantai:</strong> {bed.floor} | <strong>Ruangan:</strong> {bed.room.replace('_', ' ')}
          </p>
        </div>

        {/* Patient Info */}
        {bed.status === 'occupied' && bed.patient && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">Informasi Pasien</h3>
            <div className="space-y-1 text-xs sm:text-sm">
              <p><strong>Nama:</strong> {bed.patient.name}</p>
              {bed.patient.age && <p><strong>Usia:</strong> {bed.patient.age} tahun</p>}
              {bed.patient.gender && (
                <p><strong>Jenis Kelamin:</strong> {bed.patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
              )}
              {bed.patient.medicalRecord && (
                <p><strong>No. Rekam Medis:</strong> {bed.patient.medicalRecord}</p>
              )}
              {bed.nurse && (
                <p className="mt-2 pt-2 border-t border-blue-200">
                  <strong>PIC (Perawat):</strong> {bed.nurse.name}
                  {bed.nurse.employeeId && ` (${bed.nurse.employeeId})`}
                </p>
              )}
              {bed.assignedAt && (
                <p className="mt-2 pt-2 border-t border-blue-200">
                  <strong>Tanggal Mulai:</strong> 
                  <span className="text-blue-700 font-semibold ml-2">
                    {new Date(bed.assignedAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </p>
              )}
              {bed.releasedAt && (
                <p>
                  <strong>Tanggal Selesai:</strong> 
                  <span className="text-blue-700 font-semibold ml-2">
                    {new Date(bed.releasedAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </p>
              )}
              {occupancyDuration && (
                <p>
                  <strong>Durasi Menempati:</strong> 
                  <span className="text-blue-700 font-semibold ml-2">{occupancyDuration}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Repair Info */}
        {bed.status === 'repair' && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-sm sm:text-base font-semibold text-yellow-900 mb-2">Informasi Perbaikan</h3>
            <div className="space-y-1 text-xs sm:text-sm">
              {bed.repairNote && (
                <p className="text-yellow-800"><strong>Catatan:</strong> {bed.repairNote}</p>
              )}
              {bed.repairStartAt && (
                <p>
                  <strong>Tanggal Mulai:</strong> 
                  <span className="text-yellow-800 ml-2">
                    {new Date(bed.repairStartAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </p>
              )}
              {bed.repairEndAt && (
                <p>
                  <strong>Tanggal Selesai:</strong> 
                  <span className="text-yellow-800 ml-2">
                    {new Date(bed.repairEndAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {bed.status === 'available' && (
            <>
              <button
                onClick={() => setAction('assign')}
                className="w-full bg-blue-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
              >
                Assign Pasien ke Kasur Ini
              </button>
              <button
                onClick={() => setAction('repair')}
                className="w-full bg-yellow-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
              >
                Tandai Sedang Diperbaiki
              </button>
            </>
          )}

          {bed.status === 'occupied' && (
            <button
              onClick={handleRelease}
              className="w-full bg-green-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
            >
              Lepaskan Pasien dari Kasur
            </button>
          )}

          {bed.status === 'repair' && (
            <button
              onClick={handleSetAvailable}
              className="w-full bg-green-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-green-600 active:bg-green-700 transition-colors font-medium text-sm sm:text-base touch-manipulation"
            >
              Selesai Diperbaiki (Kembalikan ke Kosong)
            </button>
          )}

          {/* Assign Form */}
          {action === 'assign' && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Form Assign Pasien</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pasien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama pasien"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usia (opsional)</label>
                <input
                  type="number"
                  placeholder="Masukkan usia"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  min="0"
                  max="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as 'male' | 'female')}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekam Medis (opsional)</label>
                <textarea
                  placeholder="Masukkan nomor rekam medis"
                  value={medicalRecord}
                  onChange={(e) => setMedicalRecord(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai Menempati <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={assignedAt}
                  onChange={(e) => setAssignedAt(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai Menempati (opsional)
                </label>
                <input
                  type="date"
                  value={releasedAt}
                  onChange={(e) => setReleasedAt(e.target.value)}
                  min={assignedAt || undefined}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                />
                {releasedAt && assignedAt && new Date(releasedAt) <= new Date(assignedAt) && (
                  <p className="text-red-500 text-xs mt-1">Tanggal selesai harus setelah tanggal mulai</p>
                )}
              </div>
              {/* PIC Dropdown for floors 2 and 3 */}
              {(bed.floor === 2 || bed.floor === 3) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIC (Perawat Penanggung Jawab)
                  </label>
                  <select
                    value={selectedNurseId || ''}
                    onChange={(e) => setSelectedNurseId(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-sm"
                  >
                    <option value="">Pilih Perawat (Opsional)</option>
                    {nurses.map((nurse) => (
                      <option key={nurse.id} value={nurse.id}>
                        {nurse.name} {nurse.employeeId ? `(${nurse.employeeId})` : ''}
                      </option>
                    ))}
                  </select>
                  {nurses.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Belum ada perawat yang terdaftar. Tambahkan di halaman Personel.</p>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAssign}
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 sm:py-2 px-4 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Repair Form */}
          {action === 'repair' && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Form Tandai Perbaikan</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Perbaikan (opsional)</label>
                <textarea
                  placeholder="Masukkan catatan perbaikan, misalnya: kerusakan mesin, perlu pembersihan, dll"
                  value={repairNote}
                  onChange={(e) => setRepairNote(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base sm:text-sm"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai Perbaikan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={repairStartAt}
                  onChange={(e) => setRepairStartAt(e.target.value)}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai Perbaikan (opsional)
                </label>
                <input
                  type="date"
                  value={repairEndAt}
                  onChange={(e) => setRepairEndAt(e.target.value)}
                  min={repairStartAt || undefined}
                  className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-base sm:text-sm"
                />
                {repairEndAt && repairStartAt && new Date(repairEndAt) <= new Date(repairStartAt) && (
                  <p className="text-red-500 text-xs mt-1">Tanggal selesai harus setelah tanggal mulai</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRepair}
                  disabled={loading}
                  className="flex-1 bg-yellow-500 text-white py-3 sm:py-2 px-4 rounded-lg hover:bg-yellow-600 active:bg-yellow-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 sm:py-2 px-4 rounded-lg hover:bg-gray-400 active:bg-gray-500 transition-colors font-medium text-sm sm:text-base touch-manipulation"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
