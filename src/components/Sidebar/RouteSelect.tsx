import { IconType } from "react-icons";
import { FiHome, FiLayers, FiUsers, FiPaperclip } from "react-icons/fi";

type RouteSelectProps = {
  selectedPage: string;
  onSelectPage: (page: string) => void;
};

export const RouteSelect = ({ selectedPage, onSelectPage }: RouteSelectProps) => {
  return (
    <div className="space-y-1">
      <Route
        Icon={FiHome}
        selected={selectedPage === "Dashboard"}
        title="Dashboard"
        onClick={() => onSelectPage("Dashboard")}
      />
      <Route
        Icon={FiLayers}
        selected={selectedPage === "Bed"}
        title="Lantai 2"
        onClick={() => onSelectPage("Bed")}
      />
      <Route
        Icon={FiLayers}
        selected={selectedPage === "Bed2"}
        title="Lantai 3"
        onClick={() => onSelectPage("Bed2")}
      />
      <Route
        Icon={FiUsers}
        selected={selectedPage === "Personel"}
        title="Personel"
        onClick={() => onSelectPage("Personel")}
      />
    </div>
  );
};

const Route = ({
  selected,
  Icon,
  title,
  onClick,
}: {
  selected: boolean;
  Icon: IconType;
  title: string;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-start gap-2 w-full rounded px-2 py-2.5 sm:py-1.5 text-sm transition-[box-shadow,_background-color,_color] touch-manipulation ${
        selected
          ? "bg-white text-stone-950 shadow"
          : "hover:bg-stone-200 active:bg-stone-300 bg-transparent text-stone-500 shadow-none"
      }`}
    >
      <Icon className={`${selected ? "text-violet-500" : ""} w-5 h-5 sm:w-4 sm:h-4`} />
      <span>{title}</span>
    </button>
  );
};
