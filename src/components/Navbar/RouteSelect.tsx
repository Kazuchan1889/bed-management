import { IconType } from "react-icons";
import { FiHome, FiLayers, FiUsers, FiClock } from "react-icons/fi";

type RouteSelectProps = {
  selectedPage: string;
  onSelectPage: (page: string) => void;
  isMinimized?: boolean;
};

export const RouteSelect = ({ selectedPage, onSelectPage, isMinimized = false }: RouteSelectProps) => {
  return (
    <div className="space-y-1">
      <Route
        Icon={FiHome}
        selected={selectedPage === "Dashboard"}
        title="Dashboard"
        onClick={() => onSelectPage("Dashboard")}
        isMinimized={isMinimized}
      />
      <Route
        Icon={FiLayers}
        selected={selectedPage === "Bed"}
        title="Lantai 2"
        onClick={() => onSelectPage("Bed")}
        isMinimized={isMinimized}
      />
      <Route
        Icon={FiLayers}
        selected={selectedPage === "Bed2"}
        title="Lantai 3"
        onClick={() => onSelectPage("Bed2")}
        isMinimized={isMinimized}
      />
      <Route
        Icon={FiUsers}
        selected={selectedPage === "Personel"}
        title="Personel"
        onClick={() => onSelectPage("Personel")}
        isMinimized={isMinimized}
      />
      <Route
        Icon={FiClock}
        selected={selectedPage === "History"}
        title="History"
        onClick={() => onSelectPage("History")}
        isMinimized={isMinimized}
      />
    </div>
  );
};

const Route = ({
  selected,
  Icon,
  title,
  onClick,
  isMinimized = false,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  onClick: () => void;
  isMinimized?: boolean;
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 w-full rounded px-2 py-2.5 text-sm 
        transition-[box-shadow,_background-color,_color] touch-manipulation
        ${isMinimized ? 'justify-center' : 'justify-start'}
        ${
          selected
            ? "bg-white text-stone-950 shadow"
            : "hover:bg-stone-200 active:bg-stone-300 bg-transparent text-stone-500 shadow-none"
        }
      `}
      title={isMinimized ? title : undefined}
    >
      <Icon className={`${selected ? "text-violet-500" : ""} w-5 h-5 flex-shrink-0`} />
      {!isMinimized && <span>{title}</span>}
    </button>
  );
};

