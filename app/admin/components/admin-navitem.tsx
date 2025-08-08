import { IconType } from "react-icons";

interface AdminNavItemProps {
  selected?: boolean;
  icon: IconType;
  label: string;
}

export const AdminNavItem: React.FC<AdminNavItemProps> = ({
  selected,
  icon: Icon,
  label,
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row items-center justify-center text-center gap-2 p-3 border-b-2 hover:text-slate-800 dark:hover:text-white transition cursor-pointer ${
        selected
          ? "border-b-slate-800 text-slate-800 dark:text-white font-semibold"
          : "border-transparent text-slate-500"
      }`}
    >
      <Icon size={20} />
      <div className="font-md text-sm text-center break-normal">{label}</div>
    </div>
  );
};
