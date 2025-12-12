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
    <div className="px-4 grid gap-3 grid-cols-12">
      <StatCards />
      <ActivityGraph />
      <UsageRadar />
      <RecentTransactions onSelectPage={onSelectPage} />
    </div>
  );
};
