import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import Image from "next/image";
import { CartProductType } from "@prisma/client";
import { FormatPrice, TruncateText } from "@/lib/utils";

interface ItemContentProps {
  key: string;
  item: CartProductType;
}

export const ItemContent: React.FC<ItemContentProps> = ({ key, item }) => {
  return (
    <TableRow key={key}>
      <TableCell className="flex items-center gap-5">
        <Link className="hidden md:flex" href={`/product/${item.id}`}>
          <Image
            src={item.selectedImage.image}
            alt={item.name}
            width={50}
            height={50}
            className="object-contain"
          />
        </Link>
        <div className="flex flex-col gap-1">
          <span className="md:flex hidden">{TruncateText(item.name)}</span>
          <Link
            className="md:hidden flex text-blue-400 underline"
            href={`/product/${item.id}`}
          >
            {TruncateText(item.name)}
          </Link>
          <span>{item.selectedImage.color}</span>
          <span>{item.selectedSize}</span>
        </div>
      </TableCell>
      <TableCell>{FormatPrice(item.price)} VND</TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell className="text-right">
        {FormatPrice(item.price * item.quantity)} VND
      </TableCell>
    </TableRow>
  );
};
