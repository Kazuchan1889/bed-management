"use client";

import React, { useMemo, useState } from "react";
import { useBeds } from "@/context/BedContext";
import { BedModal } from "@/components/BedManagement/BedModal";

// Definisikan skema kamar dengan tipe yang benar
// Ruangan 1 (TOP_LEFT): 4 kasur [1-4]
// Ruangan 2 (TOP_RIGHT): kosong (tidak ada kasur)
// Ruangan 3 (LEFT): 7 kasur [5-11]
// Ruangan 4 (CENTER): 7 kasur [12-18]
// Ruangan 5 (RIGHT): 7 kasur [19-25]
// Ruangan 6 (BOTTOM_CENTER): 6 kasur [26-31]
const ROOM_RANGES = {
  TOP_LEFT: [1, 4] as [number, number],      // 4 kasur
  LEFT: [5, 11] as [number, number],         // 7 kasur
  CENTER: [12, 18] as [number, number],      // 7 kasur
  RIGHT: [19, 25] as [number, number],        // 7 kasur
  BOTTOM_CENTER: [26, 31] as [number, number], // 6 kasur
} as const;

const RoomKey = ["TOP_LEFT", "LEFT", "CENTER", "RIGHT", "BOTTOM_CENTER"] as const;

const BedRect: React.FC<{
  variant: "normal" | "assigned" | "repair";
  number: number;
  row: number;
  positionInRow: number; // 0 untuk kiri, 1 untuk kanan dalam row
  duration?: string;
}> = ({ variant, number, row, positionInRow, duration }) => {
  const bg = 
    variant === "repair" ? "bg-yellow-300" : 
    variant === "assigned" ? "bg-green-300" : 
    "bg-white";
  
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

const BedUnit: React.FC<{ bed: any; row: number; positionInRow: number; onClick: () => void }> = ({ bed, row, positionInRow, onClick }) => {
  const { getOccupancyDuration } = useBeds();
  const variant: "normal" | "assigned" | "repair" = 
    bed.status === "repair" ? "repair" : 
    bed.status === "occupied" ? "assigned" : 
    "normal";
  
  const duration = bed.status === "occupied" ? getOccupancyDuration(bed.id) : undefined;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
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

const BedGridRows: React.FC<{ beds: any[]; rows: number; onBedClick: (bed: any) => void }> = ({ beds, rows, onBedClick }) => {
  // Pastikan semua beds ditampilkan dengan benar
  const cells = useMemo(() => beds, [beds]);
  const chunks: any[][] = [];
  
  // Buat chunks berdasarkan rows, tapi pastikan semua beds masuk
  for (let r = 0; r < rows; r++) {
    const startIdx = r * 2;
    const endIdx = startIdx + 2;
    const chunk = cells.slice(startIdx, endIdx);
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }
  
  return (
    <div className="flex flex-col gap-3">
      {chunks.map((row, idx) => (
        <div key={idx} className="flex items-center justify-between gap-6">
          {row.map((b, pos) => (
            <BedUnit key={b.id} bed={b} row={idx + 1} positionInRow={pos} onClick={() => onBedClick(b)} />
          ))}
          {/* Jika row hanya punya 1 bed, tambahkan spacer untuk alignment */}
          {row.length === 1 && <div className="flex-1"></div>}
        </div>
      ))}
    </div>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border-4 border-sky-500 rounded-2xl p-4 bg-white/80 shadow-sm">
    <h3 className="text-sm font-semibold text-sky-700 tracking-wide">{title}</h3>
    {children}
  </section>
);

const DialysisLayoutPage: React.FC = () => {
  const { beds, filterBeds } = useBeds();
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getBedsInRange = (range: [number, number]) => {
    let filtered = beds.filter((b) => b.id >= range[0] && b.id <= range[1] && b.floor === 2);
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }
    
    return filtered;
  };

  const handleBedClick = (bed: any) => {
    setSelectedBed(bed);
    setIsModalOpen(true);
  };

  const renderRoom = (roomKey: keyof typeof ROOM_RANGES) => {
    const list = getBedsInRange(ROOM_RANGES[roomKey]);
    const roomBeds = beds.filter((b) => b.id >= ROOM_RANGES[roomKey][0] && b.id <= ROOM_RANGES[roomKey][1] && b.floor === 2);
    const availableCount = roomBeds.filter((b) => b.status === "available").length;
    const occupiedCount = roomBeds.filter((b) => b.status === "occupied").length;
    const repairCount = roomBeds.filter((b) => b.status === "repair").length;

    // Tentukan jumlah rows berdasarkan jumlah kasur
    const getRows = (roomKey: keyof typeof ROOM_RANGES): number => {
      const bedCount = roomBeds.length;
      switch (roomKey) {
        case 'TOP_LEFT': return 2;      // 4 kasur = 2 rows (2x2)
        case 'LEFT': return 4;          // 7 kasur = 4 rows (2+2+2+1)
        case 'CENTER': return 4;        // 7 kasur = 4 rows (2+2+2+1)
        case 'RIGHT': return 4;         // 7 kasur = 4 rows (2+2+2+1)
        case 'BOTTOM_CENTER': return 3; // 6 kasur = 3 rows (2x3)
        default: return Math.ceil(bedCount / 2);
      }
    };

    // Debug untuk BOTTOM_CENTER
    if (roomKey === 'BOTTOM_CENTER') {
      console.log('BOTTOM_CENTER beds:', roomBeds.length, roomBeds.map(b => b.id));
    }

    return (
      <Card title={`Bed Room (${roomKey.replace("_", " ")})`}>
        <div className="mb-2 text-xs text-gray-600">
          <span className="inline-block mr-2">Total: {roomBeds.length}</span>
          <span className="inline-block mr-2">Kosong: {availableCount}</span>
          <span className="inline-block mr-2">Terisi: {occupiedCount}</span>
          <span className="inline-block">Perbaikan: {repairCount}</span>
        </div>
        <BedGridRows 
          beds={roomBeds} 
          rows={getRows(roomKey)} 
          onBedClick={handleBedClick}
        />
      </Card>
    );
  };

  const stats = {
    total: beds.filter((b) => b.floor === 2).length,
    available: beds.filter((b) => b.floor === 2 && b.status === "available").length,
    occupied: beds.filter((b) => b.floor === 2 && b.status === "occupied").length,
    repair: beds.filter((b) => b.floor === 2 && b.status === "repair").length,
  };

  return (
    <main className="min-h-screen w-full bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">DYALISIS BED AND MACHINE MANAGEMENT</h1>
          <p className="text-gray-600">KLINIK UTAMA JAKARTA KIDNEY CENTER — Lantai 2</p>
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

        {/* TOP ROW: Top Left · Nurse Station · Consultation Room */}
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-4">{renderRoom("TOP_LEFT")}</div>

          {/* Nurse Station */}
          <div className="col-span-4 flex items-center justify-center">
            <section className="relative flex items-center justify-center">
              <div className="w-48 h-28 rounded-full border-[6px] border-sky-500 bg-white/80 shadow-sm flex items-center justify-center">
                <div className="w-[90%] h-[78%] rounded-full border border-gray-400 flex items-center justify-center">
                  <span className="text-gray-800 text-sm font-medium">Nurse Station</span>
                </div>
              </div>
            </section>
          </div>

          {/* Consultation Room */}
          <div className="col-span-4">
            <Card title="Doctor Consultation Room">
              <p className="text-[12px] text-gray-600 mt-1">(Ruang konsultasi dokter)</p>
            </Card>
          </div>
        </div>

        {/* MIDDLE ROW: Left · Center(+Bottom) · Right */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          <div className="col-span-4">{renderRoom("LEFT")}</div>
          <div className="col-span-4">{renderRoom("CENTER")}</div>
          <div className="col-span-4">{renderRoom("RIGHT")}</div>
        </div>

        {/* BOTTOM ROW: Bottom Center */}
        <div className="grid grid-cols-12 gap-4 mt-6">
          <div className="col-span-4"></div>
          <div className="col-span-4">{renderRoom("BOTTOM_CENTER")}</div>
          <div className="col-span-4"></div>
        </div>

        <div className="mt-8 rounded-xl border bg-white/80 p-4">
          <h4 className="font-semibold text-sky-700 mb-2">Legenda</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-16 h-8 border border-gray-700 rounded-sm bg-white relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">12</span>
              </div>
              <span>= Tempat tidur pasien (nomor di tengah)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-16 h-8 border border-green-600 rounded-sm bg-green-300 relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">12</span>
              </div>
              <span>= Kasur terisi (hijau)</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-16 h-8 border border-yellow-600 rounded-sm bg-yellow-300 relative">
                <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold">12</span>
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
};

export default DialysisLayoutPage;
