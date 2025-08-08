import Image from "next/image";
import { AiOutlineUser } from "react-icons/ai";

interface AvatarProps {
  src?: string | null | undefined;
}

export const Avatar: React.FC<AvatarProps> = ({ src }) => {
  if (src) {
    return (
      <Image
        src={src}
        alt="Avatar"
        className="rounded-full object-center"
        height={20}
        width={20}
      />
    );
  }
  return <AiOutlineUser size={20} />;
};
