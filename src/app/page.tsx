"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import Bed from "../components/Dashboard/Bed";        // ✅ default import
import Personel from "@/components/Dashboard/Personel"; // ✅ default import
import Bed2 from "../components/Dashboard/Bed2";
import { FiMenu, FiX } from "react-icons/fi";

export default function Home() {
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 bg-white p-3 rounded-lg shadow-lg hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <FiX className="w-6 h-6 text-stone-700" />
        ) : (
          <FiMenu className="w-6 h-6 text-stone-700" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full overflow-y-auto bg-white lg:bg-transparent">
          <Sidebar 
            selectedPage={selectedPage} 
            onSelectPage={handlePageSelect}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-[220px] p-2 sm:p-3 md:p-4 pb-4 sm:pb-6">
        {renderContent()}
      </div>
    </main>
  );
}
