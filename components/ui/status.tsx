import { Badge } from "@/components/ui/badge";
import { IconType } from "react-icons";

interface StatusProps {
  text: string;
  icon: IconType;
  className?: string;
}

export const Status: React.FC<StatusProps> = ({
  text,
  icon: Icon,
  className,
}) => {
  return (
    <Badge
      className={`${className} flex items-center gap-2 justify-evenly lg:justify-center`}
    >
      <span className="hidden lg:flex">{text}</span>
      <Icon size={15} />
    </Badge>
  );
};
