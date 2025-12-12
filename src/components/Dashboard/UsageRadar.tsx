"use client";

import React, { useMemo } from "react";
import { FiEye } from "react-icons/fi";
import { useBeds } from "@/context/BedContext";
import {
  Radar,
  RadarChart,
  PolarGrid,
  Legend,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export const UsageRadar = () => {
  const { beds, loading } = useBeds();

  // Calculate distribution by floor
  const chartData = useMemo(() => {
    const floor2Stats = {
      available: beds.filter(b => b.floor === 2 && b.status === 'available').length,
      occupied: beds.filter(b => b.floor === 2 && b.status === 'occupied').length,
      repair: beds.filter(b => b.floor === 2 && b.status === 'repair').length,
    };

    const floor3Stats = {
      available: beds.filter(b => b.floor === 3 && b.status === 'available').length,
      occupied: beds.filter(b => b.floor === 3 && b.status === 'occupied').length,
      repair: beds.filter(b => b.floor === 3 && b.status === 'repair').length,
    };

    const maxValue = Math.max(
      floor2Stats.available + floor2Stats.occupied + floor2Stats.repair,
      floor3Stats.available + floor3Stats.occupied + floor3Stats.repair
    );

    return [
      {
        feature: "Available",
        "Lantai 2": floor2Stats.available,
        "Lantai 3": floor3Stats.available,
        max: maxValue,
      },
      {
        feature: "Occupied",
        "Lantai 2": floor2Stats.occupied,
        "Lantai 3": floor3Stats.occupied,
        max: maxValue,
      },
      {
        feature: "Repair",
        "Lantai 2": floor2Stats.repair,
        "Lantai 3": floor3Stats.repair,
        max: maxValue,
      },
    ];
  }, [beds]);

  if (loading) {
    return (
      <div className="col-span-4 overflow-hidden rounded border border-stone-300 bg-white shadow-sm">
        <div className="p-4 border-b border-stone-200">
          <h3 className="flex items-center gap-1.5 font-medium text-stone-700">
            <FiEye /> Usage by Floor
          </h3>
        </div>
        <div className="h-64 px-4 py-2 flex items-center justify-center text-gray-500">
          Memuat data...
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-4 overflow-hidden rounded border border-stone-300 bg-white shadow-sm">
      <div className="p-4 border-b border-stone-200">
        <h3 className="flex items-center gap-1.5 font-medium text-stone-700">
          <FiEye /> Usage by Floor
        </h3>
      </div>

      <div className="h-64 px-4 py-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="feature"
              tick={{ fontSize: 12, fontWeight: 600, fill: "#374151" }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
            <Radar
              name="Lantai 2"
              dataKey="Lantai 2"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.25}
            />
            <Radar
              name="Lantai 3"
              dataKey="Lantai 3"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.25}
            />
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
