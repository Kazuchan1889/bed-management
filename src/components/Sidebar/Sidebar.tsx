import { RouteSelect } from "./RouteSelect";
import { AccountToggle } from "./AccountToggle";
import { FiX } from "react-icons/fi";

type SidebarProps = {
  selectedPage: string;
  onSelectPage: (page: string) => void;
  onClose?: () => void;
};

export const Sidebar = ({ selectedPage, onSelectPage, onClose }: SidebarProps) => {
  return (
    <aside className="bg-white lg:bg-white p-3 lg:p-3 rounded-lg lg:rounded-lg shadow lg:shadow h-full lg:h-fit space-y-4 w-[220px]">
      {/* Mobile Close Button */}
      {onClose && (
        <div className="flex justify-end lg:hidden">
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5 text-stone-700" />
          </button>
        </div>
      )}

      {/* Toggle Akun di bagian atas */}
      <AccountToggle />

      {/* Menu Navigasi */}
      <RouteSelect selectedPage={selectedPage} onSelectPage={onSelectPage} />
    </aside>
  );
};
