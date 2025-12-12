"use client";

import React from "react";
import { useBeds } from "@/context/BedContext";

export const StatCards = () => {
  const { stats, loading } = useBeds();

  if (loading) {
    return (
      <>
        <Card title="Available Beds" value="..." pillText="Loading" period="Loading data..." />
        <Card title="Occupied Beds" value="..." pillText="Loading" period="Loading data..." />
        <Card title="Beds Under Repair" value="..." pillText="Loading" period="Loading data..." />
      </>
    );
  }

  const availabilityRate = stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : 0;
  const occupancyRate = stats.total > 0 ? ((stats.occupied / stats.total) * 100).toFixed(0) : 0;
  const repairRate = stats.total > 0 ? ((stats.repair / stats.total) * 100).toFixed(0) : 0;

  return (
    <>
      <Card
        title="Available Beds"
        value={stats.available.toString()}
        pillText={`${availabilityRate}%`}
        period="Currently unassigned beds"
      />
      <Card
        title="Occupied Beds"
        value={stats.occupied.toString()}
        pillText={`${occupancyRate}%`}
        period="Beds in active use"
      />
      <Card
        title="Beds Under Repair"
        value={stats.repair.toString()}
        pillText={`${repairRate}%`}
        period="Currently in maintenance"
      />
    </>
  );
};

const Card = ({
  title,
  value,
  pillText,
  period,
}: {
  title: string;
  value: string;
  pillText: string;
  period: string;
}) => {
  return (
    <div className="col-span-4 p-4 rounded-lg border border-stone-300 shadow-sm bg-white">
      <div className="flex mb-6 items-start justify-between">
        <div>
          <h3 className="text-stone-500 mb-2 text-sm font-medium">{title}</h3>
          <p className="text-3xl font-semibold">{value}</p>
        </div>
        <span className="text-xs flex items-center gap-1 font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">
          {pillText}
        </span>
      </div>
      <p className="text-xs text-stone-500">{period}</p>
    </div>
  );
};
