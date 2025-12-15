"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import Bed from "../components/Dashboard/Bed";        // ✅ default import
import Personel from "@/components/Dashboard/Personel"; // ✅ default import
import Bed2 from "../components/Dashboard/Bed2";
import History from "@/components/Dashboard/History";

export default function Home() {
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const renderContent = () => {
    switch (selectedPage) {
      case "Dashboard":
        return <Dashboard />;
      case "Bed":
        return <Bed />;
      case "Bed2":
        return <Bed2 />;
      case "Personel":
        return <Personel />;
      case "History":
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  const handlePageSelect = (page: string) => {
    setSelectedPage(page);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  return (
    <main className="min-h-screen bg-stone-100">
      {/* Navbar */}
      <Navbar
        selectedPage={selectedPage}
        onSelectPage={handlePageSelect}
        isMobileMenuOpen={sidebarOpen}
        onMobileMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
      />

      {/* Main Content */}
      <div 
        className={`
          p-2 sm:p-3 md:p-4 pb-4 sm:pb-6 transition-all duration-300
          lg:pt-0 pt-20
          ${isMinimized ? 'lg:ml-[80px]' : 'lg:ml-[220px]'}
        `}
      >
        {renderContent()}
      </div>
    </main>
  );
}
