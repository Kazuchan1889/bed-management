"use client";

import React, { useState, useEffect } from 'react';
import { nurseAPI, Nurse, NurseAssignment } from '@/lib/api';
import { useBeds } from '@/context/BedContext';

export default function Personel() {
  const { beds } = useBeds();
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [assignments, setAssignments] = useState<NurseAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadNurses();
    loadAssignments();
  }, []);

  const loadNurses = async () => {
    try {
      setLoading(true);
      const data = await nurseAPI.getAllNurses();
      setNurses(data);
    } catch (error) {
      console.error('Error loading nurses:', error);
      alert('Gagal memuat data perawat');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const data = await nurseAPI.getAllAssignments({ active: true });
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama perawat harus diisi');
      return;
    }

    try {
      setLoading(true);
      if (editingNurse) {
        await nurseAPI.updateNurse(editingNurse.id, formData);
      } else {
        await nurseAPI.createNurse(formData);
      }
      
      await loadNurses();
      resetForm();
      alert(editingNurse ? 'Perawat berhasil diperbarui' : 'Perawat berhasil ditambahkan');
    } catch (error) {
      console.error('Error saving nurse:', error);
      alert('Gagal menyimpan perawat: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setFormData({
      name: nurse.name,
      employeeId: nurse.employeeId || '',
      phone: nurse.phone || '',
      email: nurse.email || '',
      status: nurse.status,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus perawat ini?')) return;

    try {
      setLoading(true);
      await nurseAPI.deleteNurse(id);
      await loadNurses();
      await loadAssignments();
      alert('Perawat berhasil dihapus');
    } catch (error) {
      console.error('Error deleting nurse:', error);
      alert('Gagal menghapus perawat');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      employeeId: '',
      phone: '',
      email: '',
      status: 'active',
    });
    setEditingNurse(null);
    setShowAddForm(false);
  };

  const getNurseAssignments = (nurseId: number) => {
    return assignments.filter(a => a.nurseId === nurseId);
  };

  const getAssignmentDuration = (assignment: NurseAssignment): string => {
    const start = new Date(assignment.assignedAt);
    const end = assignment.releasedAt ? new Date(assignment.releasedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} hari ${hours} jam`;
    } else if (hours > 0) {
      return `${hours} jam`;
    } else {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} menit`;
    }
  };

  const getBedInfo = (bedId: number) => {
    const bed = beds.find(b => b.id === bedId);
    return bed ? `Kasur #${bed.id} (Lantai ${bed.floor}, ${bed.room})` : `Kasur #${bedId}`;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Personel Perawat</h1>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          + Tambah Perawat
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            {editingNurse ? 'Edit Perawat' : 'Tambah Perawat Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Perawat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Karyawan
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : editingNurse ? 'Perbarui' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nurses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Daftar Perawat</h2>
        
        {loading && !nurses.length ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : nurses.length === 0 ? (
          <p className="text-gray-500">Belum ada perawat yang terdaftar</p>
        ) : (
          <div className="space-y-4">
            {nurses.map((nurse) => {
              const nurseAssignments = getNurseAssignments(nurse.id);
              return (
                <div
                  key={nurse.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{nurse.name}</h3>
                      <div className="text-sm text-gray-600 space-y-1 mt-1">
                        {nurse.employeeId && <p>ID: {nurse.employeeId}</p>}
                        {nurse.phone && <p>Telp: {nurse.phone}</p>}
                        {nurse.email && <p>Email: {nurse.email}</p>}
                        <p>
                          Status:{' '}
                          <span className={`font-medium ${nurse.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                            {nurse.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(nurse)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(nurse.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Assignments */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Assignment Aktif ({nurseAssignments.length})
                    </h4>
                    {nurseAssignments.length === 0 ? (
                      <p className="text-sm text-gray-500">Belum ada assignment</p>
                    ) : (
                      <div className="space-y-2">
                        {nurseAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="bg-blue-50 p-3 rounded border border-blue-200"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {getBedInfo(assignment.bedId)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Mulai: {new Date(assignment.assignedAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                <p className="text-sm font-medium text-blue-700 mt-1">
                                  Durasi: {getAssignmentDuration(assignment)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
