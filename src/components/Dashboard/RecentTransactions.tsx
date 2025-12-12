"use client";

import React, { useState, useMemo } from "react";
import { useBeds } from "@/context/BedContext";

export const RecentTransactions = ({
  onSelectPage,
}: {
  onSelectPage?: (page: string) => void;
}) => {
  const { beds, loading } = useBeds();
  const [showAll, setShowAll] = useState(false);

  // Group beds by room
  const roomsData = useMemo(() => {
    const roomMap: Record<string, { available: number; occupied: number; repair: number }> = {};

    beds.forEach((bed) => {
      if (!roomMap[bed.room]) {
        roomMap[bed.room] = { available: 0, occupied: 0, repair: 0 };
      }

      if (bed.status === "available") {
        roomMap[bed.room].available++;
      } else if (bed.status === "occupied") {
        roomMap[bed.room].occupied++;
      } else if (bed.status === "repair") {
        roomMap[bed.room].repair++;
      }
    });

    return Object.entries(roomMap).map(([room, stats]) => ({
      room,
      ...stats,
    }));
  }, [beds]);

  const visibleRooms = showAll ? roomsData : roomsData.slice(0, 5);

  if (loading) {
    return (
      <div className="col-span-12 p-4 rounded border border-stone-300 bg-white shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-medium">Bed Availability by Room</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      </div>
    );
  }

  if (roomsData.length === 0) {
    return (
      <div className="col-span-12 p-4 rounded border border-stone-300 bg-white shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 font-medium">Bed Availability by Room</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Tidak ada data ruangan</div>
      </div>
    );
  }

  return (
    <div className="col-span-12 p-4 rounded border border-stone-300 bg-white shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">Bed Availability by Room</h3>
        {roomsData.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-violet-500 hover:underline"
          >
            {showAll ? "Show less" : `See all (${roomsData.length})`}
          </button>
        )}
      </div>
      <table className="w-full table-auto">
        <TableHead />
        <tbody>
          {visibleRooms.map((roomData, index) => (
            <TableRow
              key={roomData.room}
              room={roomData.room}
              available={roomData.available}
              occupied={roomData.occupied}
              repaired={roomData.repair}
              order={index + 1}
              onSelectPage={onSelectPage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableHead = () => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        <th className="text-start p-1.5">Room</th>
        <th className="text-center p-1.5">Available Beds</th>
        <th className="text-center p-1.5">Occupied Beds</th>
        <th className="text-center p-1.5">Repaired Beds</th>
        <th className="w-16"></th>
      </tr>
    </thead>
  );
};

const TableRow = ({
  room,
  available,
  occupied,
  repaired,
  order,
  onSelectPage,
}: {
  room: string;
  available: number;
  occupied: number;
  repaired: number;
  order: number;
  onSelectPage?: (page: string) => void;
}) => {
  // Determine which page to navigate based on room floor
  const getPageForRoom = (roomName: string): string => {
    // Floor 2 rooms
    if (['TOP_LEFT', 'LEFT', 'CENTER', 'RIGHT', 'BOTTOM_CENTER'].includes(roomName)) {
      return 'Bed';
    }
    // Floor 3 rooms
    if (['LEFT_TOP', 'LEFT_BOTTOM', 'MIDDLE', 'RIGHT_TOP', 'RIGHT_BOTTOM'].includes(roomName)) {
      return 'Bed2';
    }
    return 'Bed';
  };

  return (
    <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
      <td className="p-1.5 font-medium text-gray-700">{room.replace('_', ' ')}</td>
      <td className="p-1.5 text-green-700 font-semibold text-center">
        {available}
      </td>
      <td className="p-1.5 text-blue-700 font-semibold text-center">
        {occupied}
      </td>
      <td className="p-1.5 text-yellow-700 font-semibold text-center">
        {repaired}
      </td>
      <td className="p-1.5 text-center">
        <button
          onClick={() => onSelectPage && onSelectPage(getPageForRoom(room))}
          className="px-3 py-1 text-xs font-medium rounded bg-violet-100 text-violet-700 hover:bg-violet-200 transition"
        >
          Detail
        </button>
      </td>
    </tr>
  );
};
