"use client";

import React, { useEffect, useState } from "react";
import { bedAPI } from "@/lib/api";
import { BedHistory } from "@/types/bed";
import { FiClock, FiUser, FiLayers, FiCalendar } from "react-icons/fi";

export default function History() {
  const [history, setHistory] = useState<BedHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{ floor?: number }>({});

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { historyAPI } = await import('@/lib/api');
      const data = await historyAPI.getHistory({ floor: filter.floor });
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'assigned':
        return 'Ditugaskan';
      case 'released':
        return 'Dilepas';
      case 'repair':
        return 'Perbaikan';
      case 'available':
        return 'Tersedia';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'assigned':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'released':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'repair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'available':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter history for floor 2 and 3 (the floors shown in Bed and Bed2 pages)
  const filteredHistory = history.filter(item => {
    if (filter.floor) {
      return item.bed.floor === filter.floor;
    }
    // Show floor 2 and 3 by default (the actual floors in the system)
    return item.bed.floor === 2 || item.bed.floor === 3;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <FiClock className="w-6 h-6 text-violet-600" />
          <h1 className="text-2xl font-bold text-stone-900">History Penugasan Bed</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter({})}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !filter.floor
                ? 'bg-violet-600 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            Semua Lantai
          </button>
          <button
            onClick={() => setFilter({ floor: 2 })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.floor === 2
                ? 'bg-violet-600 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            Lantai 2
          </button>
          <button
            onClick={() => setFilter({ floor: 3 })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter.floor === 3
                ? 'bg-violet-600 text-white'
                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            Lantai 3
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            <p className="mt-2 text-stone-600">Memuat history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-stone-500">
            <FiClock className="w-12 h-12 mx-auto mb-3 text-stone-400" />
            <p>Tidak ada history penugasan bed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Bed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Pasien
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Perawat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Tanggal Mulai
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Tanggal Selesai
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(
                          item.action
                        )}`}
                      >
                        {getActionLabel(item.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FiLayers className="w-4 h-4 text-stone-400" />
                        <span className="text-sm font-medium text-stone-900">
                          {item.bed.room} - Bed {item.bed.id}
                        </span>
                        <span className="text-xs text-stone-500">
                          (Lantai {item.bed.floor})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.patient ? (
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-stone-400" />
                          <div>
                            <div className="text-sm font-medium text-stone-900">
                              {item.patient.name}
                            </div>
                            {item.patient.medicalRecord && (
                              <div className="text-xs text-stone-500">
                                MR: {item.patient.medicalRecord}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.nurse ? (
                        <div className="text-sm text-stone-900">
                          {item.nurse.name}
                          {item.nurse.employeeId && (
                            <div className="text-xs text-stone-500">
                              ID: {item.nurse.employeeId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {formatDate(item.assignedAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      {formatDate(item.releasedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

