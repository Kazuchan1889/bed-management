"use client";

import React, { useMemo } from "react";
import { FiUser } from "react-icons/fi";
import { useBeds } from "@/context/BedContext";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
} from "recharts";

export const ActivityGraph = () => {
  const { beds, loading } = useBeds();

  // Calculate statistics by room
  const chartData = useMemo(() => {
    const roomStats: Record<string, { occupied: number; repair: number }> = {};

    beds.forEach((bed) => {
      const roomName = bed.room.replace('_', ' ');
      if (!roomStats[roomName]) {
        roomStats[roomName] = { occupied: 0, repair: 0 };
      }

      if (bed.status === 'occupied') {
        roomStats[roomName].occupied++;
      } else if (bed.status === 'repair') {
        roomStats[roomName].repair++;
      }
    });

    return Object.entries(roomStats)
      .map(([name, stats]) => ({
        name: name.length > 10 ? name.substring(0, 10) + '...' : name,
        fullName: name,
        Occupied: stats.occupied,
        Repair: stats.repair,
      }))
      .sort((a, b) => (b.Occupied + b.Repair) - (a.Occupied + a.Repair))
      .slice(0, 7); // Show top 7 rooms
  }, [beds]);

  if (loading) {
    return (
      <div className="col-span-8 overflow-hidden rounded border border-stone-300">
        <div className="p-4">
          <h3 className="flex items-center gap-1.5 font-medium">
            <FiUser /> Bed's Statistics by Room
          </h3>
        </div>
        <div className="h-64 px-4 flex items-center justify-center text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="col-span-8 overflow-hidden rounded border border-stone-300">
        <div className="p-4">
          <h3 className="flex items-center gap-1.5 font-medium">
            <FiUser /> Bed's Statistics by Room
          </h3>
        </div>
        <div className="h-64 px-4 flex items-center justify-center text-gray-500">
          Tidak ada data
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-8 overflow-hidden rounded border border-stone-300">
      <div className="p-4">
        <h3 className="flex items-center gap-1.5 font-medium">
          <FiUser /> Bed's Statistics by Room
        </h3>
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={400}
            data={chartData}
            margin={{
              top: 0,
              right: 0,
              left: -24,
              bottom: 0,
            }}
          >
            <CartesianGrid stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs font-bold"
              padding={{ right: 4 }}
            />
            <YAxis
              className="text-xs font-bold"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
              formatter={(value: any) => [value, '']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return payload[0].payload.fullName;
                }
                return label;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Occupied"
              stroke="#3b82f6"
              fill="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="Repair"
              stroke="#eab308"
              fill="#eab308"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
