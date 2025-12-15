"use client";

import React from "react";
import { StatCards } from "./StatCards";
import { ActivityGraph } from "./ActivityGraph";
import { UsageRadar } from "./UsageRadar";
import { RecentTransactions } from "./RecentTransactions";

interface GridProps {
  onSelectPage?: (page: string) => void;
}

export const Grid: React.FC<GridProps> = ({ onSelectPage }) => {
  return (
    <div className="px-2 sm:px-4 grid gap-3 grid-cols-1 sm:grid-cols-12">
      <div className="sm:col-span-12">
        <StatCards />
      </div>
      <div className="sm:col-span-12 lg:col-span-8">
        <ActivityGraph />
      </div>
      <div className="sm:col-span-12 lg:col-span-4">
        <UsageRadar />
      </div>
      <div className="sm:col-span-12">
        <RecentTransactions onSelectPage={onSelectPage} />
      </div>
    </div>
  );
};
