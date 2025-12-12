"use client";

import React from "react";
import { FiCalendar } from "react-icons/fi";
import { useBeds } from "@/context/BedContext";

// fungsi format tanggal sesuai contoh
const formatDate = (date: Date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${dayName}, ${monthName} ${day}${getOrdinal(day)} ${year}`;
};

// fungsi untuk menentukan greeting sesuai jam
const getGreeting = (hour: number) => {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

export const TopBar = () => {
  const { stats, refreshBeds } = useBeds();
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const occupancyRate = stats.total > 0 ? ((stats.occupied / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200 relative">
      <div className="flex items-center justify-between p-0.5">
        <div>
          <span className="text-sm font-bold block">🚀 {greeting}!</span>
          <span className="text-xs block text-stone-500">
            {formatDate(now)} • {stats.total} Total Beds • {occupancyRate}% Occupied
          </span>
        </div>

        <div className="relative">
          <button
            onClick={refreshBeds}
            className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded"
          >
            <FiCalendar />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
