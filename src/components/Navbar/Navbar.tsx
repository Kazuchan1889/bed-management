import { useState } from "react";
import { RouteSelect } from "./RouteSelect";
import { AccountToggle } from "./AccountToggle";
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

type NavbarProps = {
  selectedPage: string;
  onSelectPage: (page: string) => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
};

export const Navbar = ({ selectedPage, onSelectPage, isMobileMenuOpen, onMobileMenuToggle, isMinimized, onToggleMinimize }: NavbarProps) => {
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full bg-white shadow-lg z-30 transition-all duration-300 ease-in-out"
        style={{ width: isMinimized ? '80px' : '220px' }}>
        <div className="flex flex-col h-full w-full">
          {/* Account Section */}
          <div className="p-3 border-b border-stone-200">
            {!isMinimized && <AccountToggle />}
            {isMinimized && (
              <div className="flex justify-center py-2">
                <img
                  src="https://api.dicebear.com/9.x/notionists/svg"
                  alt="avatar"
                  className="size-10 rounded bg-violet-500 shadow"
                />
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto py-2">
            <RouteSelect 
              selectedPage={selectedPage} 
              onSelectPage={onSelectPage}
              isMinimized={isMinimized}
            />
          </div>

          {/* Minimize Toggle Button */}
          <div className="p-3 border-t border-stone-200">
            <button
              onClick={onToggleMinimize}
              className="w-full flex items-center justify-center p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label={isMinimized ? "Expand menu" : "Minimize menu"}
            >
              {isMinimized ? (
                <FiChevronRight className="w-5 h-5 text-stone-700" />
              ) : (
                <FiChevronLeft className="w-5 h-5 text-stone-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Header Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="p-2 hover:bg-stone-100 active:bg-stone-200 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6 text-stone-700" />
              ) : (
                <FiMenu className="w-6 h-6 text-stone-700" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <img
                src="https://api.dicebear.com/9.x/notionists/svg"
                alt="avatar"
                className="size-8 rounded bg-violet-500 shadow"
              />
              <div>
                <span className="text-sm font-bold block">JKC Hospital</span>
                <span className="text-xs block text-stone-500">021-7823515</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onMobileMenuToggle}
          />
          <aside
            className={`
              lg:hidden fixed top-0 left-0 h-full bg-white shadow-xl z-50
              transform transition-transform duration-300 ease-in-out
              translate-x-0
              w-[280px]
            `}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Close Button */}
              <div className="flex justify-end p-4 border-b border-stone-200">
                <button
                  onClick={onMobileMenuToggle}
                  className="p-2 hover:bg-stone-100 active:bg-stone-200 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <FiX className="w-6 h-6 text-stone-700" />
                </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <AccountToggle />
                <RouteSelect 
                  selectedPage={selectedPage} 
                  onSelectPage={(page) => {
                    onSelectPage(page);
                    onMobileMenuToggle();
                  }}
                  isMinimized={false}
                />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

