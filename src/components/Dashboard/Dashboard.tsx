"use client";

import React from "react";
import { useBeds } from "@/context/BedContext";
import { TopBar } from "./TopBar";
import { Grid } from "./Grid";

export const Dashboard = () => {
  const { stats, beds, loading, error } = useBeds();

  const floor2Stats = {
    total: beds.filter((b) => b.floor === 2).length,
    available: beds.filter((b) => b.floor === 2 && b.status === "available").length,
    occupied: beds.filter((b) => b.floor === 2 && b.status === "occupied").length,
    repair: beds.filter((b) => b.floor === 2 && b.status === "repair").length,
  };

  const floor3Stats = {
    total: beds.filter((b) => b.floor === 3).length,
    available: beds.filter((b) => b.floor === 3 && b.status === "available").length,
    occupied: beds.filter((b) => b.floor === 3 && b.status === "occupied").length,
    repair: beds.filter((b) => b.floor === 3 && b.status === "repair").length,
  };

  const occupancyRate = stats.total > 0 ? ((stats.occupied / stats.total) * 100).toFixed(1) : 0;
  const availabilityRate = stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg pb-4 shadow">
        <TopBar />
        <div className="p-6 text-center">
          <div className="text-lg text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg pb-4 shadow">
        <TopBar />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error Memuat Data</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-600 text-sm mt-2">Pastikan backend API berjalan di http://localhost:3001</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg pb-4 shadow">
      <TopBar />
      
      {/* Overall Statistics */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Statistik Keseluruhan</h2>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">Total Kasur</div>
            <div className="text-3xl font-bold text-blue-800">{stats.total}</div>
            <div className="text-xs text-blue-600 mt-1">Semua lantai</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">Kasur Kosong</div>
            <div className="text-3xl font-bold text-green-800">{stats.available}</div>
            <div className="text-xs text-green-600 mt-1">{availabilityRate}% dari total</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">Kasur Terisi</div>
            <div className="text-3xl font-bold text-purple-800">{stats.occupied}</div>
            <div className="text-xs text-purple-600 mt-1">{occupancyRate}% dari total</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-200">
            <div className="text-sm text-yellow-600 font-medium mb-1">Sedang Diperbaiki</div>
            <div className="text-3xl font-bold text-yellow-800">{stats.repair}</div>
            <div className="text-xs text-yellow-600 mt-1">Perlu perhatian</div>
          </div>
        </div>

        {/* Floor-wise Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Lantai 2</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-xl font-bold text-gray-800">{floor2Stats.total}</div>
              </div>
              <div>
                <div className="text-xs text-green-600">Kosong</div>
                <div className="text-xl font-bold text-green-700">{floor2Stats.available}</div>
              </div>
              <div>
                <div className="text-xs text-purple-600">Terisi</div>
                <div className="text-xl font-bold text-purple-700">{floor2Stats.occupied}</div>
              </div>
              <div>
                <div className="text-xs text-yellow-600">Perbaikan</div>
                <div className="text-xl font-bold text-yellow-700">{floor2Stats.repair}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Lantai 3</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-600">Total</div>
                <div className="text-xl font-bold text-gray-800">{floor3Stats.total}</div>
              </div>
              <div>
                <div className="text-xs text-green-600">Kosong</div>
                <div className="text-xl font-bold text-green-700">{floor3Stats.available}</div>
              </div>
              <div>
                <div className="text-xs text-purple-600">Terisi</div>
                <div className="text-xl font-bold text-purple-700">{floor3Stats.occupied}</div>
              </div>
              <div>
                <div className="text-xs text-yellow-600">Perbaikan</div>
                <div className="text-xl font-bold text-yellow-700">{floor3Stats.repair}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Info */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Cara Menggunakan</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Klik pada kasur untuk melihat detail dan mengelola status</li>
            <li>• Kasur hijau = Terisi oleh pasien (durasi ditampilkan di bawah)</li>
            <li>• Kasur putih = Kosong dan siap digunakan</li>
            <li>• Kasur kuning = Sedang diperbaiki</li>
            <li>• Gunakan filter untuk melihat kasur berdasarkan status</li>
            <li>• Data tersimpan otomatis di database</li>
          </ul>
        </div>
      </div>

      <Grid />
    </div>
  );
};
