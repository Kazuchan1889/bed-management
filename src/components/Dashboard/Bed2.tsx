"use client";

import React, { useMemo, useState } from "react";
import { useBeds } from "@/context/BedContext";
import { BedModal } from "@/components/BedManagement/BedModal";

type RoomKey =
  | "LEFT_TOP"
  | "LEFT_BOTTOM"
  | "MIDDLE"
  | "RIGHT_TOP"
  | "RIGHT_BOTTOM";

// Lantai 3 beds dimulai dari 32 (karena Lantai 2 berakhir di 31)
const ROOM_CONFIG: Record<RoomKey, { title: string; rows: number; range: [number, number] }> = {
  LEFT_TOP: { title: "Bed Room (Left Top)", rows: 1, range: [32, 33] },
  LEFT_BOTTOM: { title: "Bed Room (Left Bottom)", rows: 3, range: [34, 39] },
  MIDDLE: { title: "Bed Room (Middle)", rows: 3, range: [40, 45] },
  RIGHT_TOP: { title: "Bed Room (Right Top)", rows: 1, range: [46, 47] },
  RIGHT_BOTTOM: { title: "Bed Room (Right Bottom)", rows: 3, range: [48, 53] },
};

const inRange = (b: any, [s, e]: [number, number]) => b.id >= s && b.id <= e;
const pick = (beds: any[], range: [number, number]) => beds.filter((b) => inRange(b, range));

const BedRect: React.FC<{ variant: "normal" | "assigned" | "repair"; number: number; row: number; positionInRow: number; duration?: string }> = ({ 
  variant, 
  number, 
  row, 
  positionInRow,
  duration 
}) => {
  const bg =
    variant === "repair"
      ? "bg-yellow-300"
      : variant === "assigned"
      ? "bg-green-300"
      : "bg-white";

  const borderColor = 
    variant === "repair" ? "border-yellow-600" : 
    variant === "assigned" ? "border-green-600" : 
    "border-gray-400";

  // Small box di ujung kasur:
  // - Baris ganjil (1, 3, 5...): small box di bawah kasur
  // - Baris genap (2, 4, 6...): small box di atas kasur
  // - Posisi kiri/kanan tergantung positionInRow (0 = kiri, 1 = kanan)
  const smallBoxOnTop = row % 2 === 0; // Row genap = atas, row ganjil = bawah
  const smallBoxOnLeft = positionInRow === 0; // 0 = kiri, 1 = kanan

  return (
    <div className="flex flex-col items-center justify-center relative group">
      {/* Small box di atas bed (untuk baris genap) */}
      {smallBoxOnTop && (
        <div className={`w-4 h-4 border-2 ${borderColor} mb-1 ${smallBoxOnLeft ? "self-start" : "self-end"}`}></div>
      )}
      {/* Bed rectangle */}
      <div className={`${bg} w-24 h-12 border-2 ${borderColor} relative flex items-center justify-center`}>
        <span className="text-xs font-semibold text-gray-800">{number}</span>
        {variant === "repair" && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-600 rounded-full border border-yellow-800"></div>
        )}
      </div>
      {/* Small box di bawah bed (untuk baris ganjil) */}
      {!smallBoxOnTop && (
        <div className={`w-4 h-4 border-2 ${borderColor} mt-1 ${smallBoxOnLeft ? "self-start" : "self-end"}`}></div>
      )}
    </div>
  );
};

const BedUnit: React.FC<{ bed: any; row: number; positionInRow: number; onClick: (b: any) => void }> = ({ bed, row, positionInRow, onClick }) => {
  const { getOccupancyDuration } = useBeds();
  const variant: "normal" | "assigned" | "repair" = 
    bed.status === "repair" ? "repair" : 
    bed.status === "occupied" ? "assigned" : 
    "normal";

  const duration = bed.status === "occupied" ? getOccupancyDuration(bed.id) : undefined;

  return (
    <button
      type="button"
      onClick={() => onClick(bed)}
      className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity cursor-pointer"
      title={
        bed.status === "occupied" && bed.patient
          ? `Kasur ${bed.id} - ${bed.patient.name} (${duration})`
          : bed.status === "repair"
          ? `Kasur ${bed.id} - Sedang Diperbaiki`
          : `Kasur ${bed.id} - Kosong`
      }
    >
      <BedRect variant={variant} number={bed.id} row={row} positionInRow={positionInRow} duration={duration} />
    </button>
  );
};

const BedGridRows: React.FC<{ beds: any[]; rows: number; onClick: (b: any) => void }> = ({ beds, rows, onClick }) => {
  const cells = useMemo(() => beds.slice(0, rows * 2), [beds, rows]);
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center justify-between gap-6">
          {cells.slice(r * 2, r * 2 + 2).map((b, pos) => (
            <BedUnit key={b.id} bed={b} row={r + 1} positionInRow={pos} onClick={onClick} />
          ))}
        </div>
      ))}
    </div>
  );
};

const Card: React.FC<React.PropsWithChildren<{ title?: string; subtitle?: string; className?: string }>> = ({
  title,
  subtitle,
  className = "",
  children,
}) => (
  <section className={`border-4 border-sky-500 rounded-2xl p-4 bg-white/80 shadow-sm ${className}`}>
    {title && (
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-sky-700 tracking-wide">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
      </div>
    )}
    {children}
  </section>
);

export default function DialysisFloor3Page() {
  const { beds, getOccupancyDuration } = useBeds();
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getBeds = (key: RoomKey) => {
    let filtered = pick(beds, ROOM_CONFIG[key].range).filter((b) => b.floor === 3);
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }
    
    return filtered;
  };

  const handleBedClick = (bed: any) => {
    setSelectedBed(bed);
    setIsModalOpen(true);
  };

  const Room: React.FC<{ k: RoomKey }> = ({ k }) => {
    const cfg = ROOM_CONFIG[k];
    const allBeds = beds.filter((b) => b.id >= cfg.range[0] && b.id <= cfg.range[1] && b.floor === 3);
    const list = getBeds(k);
    const availableCount = allBeds.filter((b) => b.status === "available").length;
    const occupiedCount = allBeds.filter((b) => b.status === "occupied").length;
    const repairCount = allBeds.filter((b) => b.status === "repair").length;

    return (
      <Card
        title={cfg.title}
        subtitle={`Kasur: ${allBeds.map((b) => b.id).join(", ") || "-"} | Kosong: ${availableCount} | Terisi: ${occupiedCount} | Perbaikan: ${repairCount}`}
      >
        <BedGridRows beds={allBeds} rows={cfg.rows} onClick={handleBedClick} />
      </Card>
    );
  };

  const stats = {
    total: beds.filter((b) => b.floor === 3).length,
    available: beds.filter((b) => b.floor === 3 && b.status === "available").length,
    occupied: beds.filter((b) => b.floor === 3 && b.status === "occupied").length,
    repair: beds.filter((b) => b.floor === 3 && b.status === "repair").length,
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">
            DYALISIS BED AND MACHINE MANAGEMENT
          </h1>
          <p className="text-gray-600">KLINIK UTAMA JAKARTA KIDNEY CENTER — Lantai 3</p>
        </header>

        {/* Statistics Bar */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <div className="text-sm text-gray-600">Total Kasur</div>
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-sm text-gray-600">Kosong</div>
            <div className="text-2xl font-bold text-green-700">{stats.available}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-sm text-gray-600">Terisi</div>
            <div className="text-2xl font-bold text-blue-700">{stats.occupied}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
            <div className="text-sm text-gray-600">Diperbaiki</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.repair}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter("available")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === "available"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Kosong
          </button>
          <button
            onClick={() => setStatusFilter("occupied")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === "occupied"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Terisi
          </button>
          <button
            onClick={() => setStatusFilter("repair")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              statusFilter === "repair"
                ? "bg-yellow-500 text-white"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            Diperbaiki
          </button>
        </div>

        {/* TOP ZONE: three columns with top/bottom splits on left & right */}
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-4 space-y-4">
            <Room k="LEFT_TOP" />
            <Room k="LEFT_BOTTOM" />
          </div>

          <div className="col-span-4">
            <Room k="MIDDLE" />
          </div>

          <div className="col-span-4 space-y-4">
            <Room k="RIGHT_TOP" />
            <Room k="RIGHT_BOTTOM" />
          </div>
        </div>

        {/* BOTTOM ZONE: Doctor room (left), Nurse station (center), corridor (right) */}
        <div className="grid grid-cols-12 gap-4 items-start mt-6">
          <div className="col-span-4">
            <Card>
              <h3 className="text-sm font-semibold text-sky-700 tracking-wide">
                Doctor Consultation Room
              </h3>
            </Card>
          </div>

          <div className="col-span-4 flex items-center justify-center">
            <section className="relative flex items-center justify-center">
              <div className="w-48 h-28 rounded-full border-[6px] border-sky-500 bg-white/80 shadow-sm flex items-center justify-center">
                <div className="w-[90%] h-[78%] rounded-full border border-gray-400 flex items-center justify-center">
                  <span className="text-gray-800 text-sm font-medium">
                    Nurse Station
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-4">
            <div className="h-full" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 rounded-xl border bg-white/80 p-4">
          <h4 className="font-semibold text-sky-700 mb-2">Legenda</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-16 h-8 border border-gray-700 rounded-sm bg-white relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
                  12
                </span>
              </div>
              <span>= Tempat tidur pasien (nomor di tengah)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-16 h-8 border border-green-600 rounded-sm bg-green-300 relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
                  12
                </span>
              </div>
              <span>= Kasur terisi (hijau)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-16 h-8 border border-yellow-600 rounded-sm bg-yellow-300 relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">
                  12
                </span>
              </div>
              <span>= Kasur diperbaiki (kuning)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-3 h-3 border border-gray-700 rounded-sm bg-white" />
              <span>= Mesin dialisis</span>
            </li>
            <li>( O ) Nurse Station</li>
            <li>Klik kasur untuk melihat detail dan mengelola</li>
          </ul>
        </div>
      </div>

      {selectedBed && (
        <BedModal
          bed={selectedBed}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBed(null);
          }}
        />
      )}
    </main>
  );
}
