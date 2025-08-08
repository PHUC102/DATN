"use client";

import { Product } from "@prisma/client";
import { FormatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MdCached,
  MdClose,
  MdDelete,
  MdDone,
  MdRemoveRedEye,
} from "react-icons/md";
import { useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { deleteObject, getStorage, ref } from "firebase/storage";
import firebase from "@/lib/firebase";
import { Status } from "@/components/ui/status";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BsPencilSquare } from "react-icons/bs";

interface ManageProductClientProps {
  products: Product[];
}

export const ManageProductClient: React.FC<ManageProductClientProps> = ({
  products,
}) => {
  const router = useRouter();
  const storage = getStorage(firebase);

  const handleToggleStock = useCallback(
    (id: string, inStock: boolean) => {
      axios
        .put("/api/product", {
          id,
          inStock: !inStock,
        })
        .then((res) => {
          toast.success("Trạng thái sản phẩm đã thay đổi");
          router.refresh();
        })
        .catch((error) => {
          toast.error("Đã xảy ra lỗi");
          console.log(error);
        });
    },
    [router]
  );

  const handleDelete = useCallback(
    async (id: string, images: any[]) => {
      toast("Đang xóa sản phẩm. Vui lòng chờ...");
      const handleImageDelete = async () => {
        try {
          for (const item of images) {
            if (item.image) {
              const imageRef = ref(storage, item.image);
              await deleteObject(imageRef);
              console.log("Đã xóa hình ảnh", item.image);
            }
          }
        } catch (error) {
          return console.log(error);
        }
      };

      await handleImageDelete();

      axios
        .delete(`/api/product/${id}`)
        .then((res) => {
          toast.success("Đã xóa sản phẩm!");
          router.refresh();
        })
        .catch((error) => {
          toast.error("Đã xảy ra lỗi");
          console.log(error);
        });
    },
    [storage, router]
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-5 text-center font-semibold">
        Quản lý sản phẩm
      </h1>
      <Table>
        <TableCaption className="text-center lg:text-right "></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Giá (VND)</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead className="text-center">Dung tích</TableHead>
            <TableHead className="text-center">Trong kho</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{FormatPrice(product.price)} VND</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="text-center">
                {product.sizes.join(", ")}
              </TableCell>
              <TableCell>
                {product.inStock ? (
                  <Status
                    text="Còn hàng"
                    icon={MdDone}
                    className="bg-green-500 text-white"
                  />
                ) : (
                  <Status
                    text="Hết hàng"
                    icon={MdClose}
                    className="bg-rose-500 text-white"
                  />
                )}
              </TableCell>
              <TableCell className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => handleToggleStock(product.id, product.inStock)}
                  variant="outline"
                  size="icon"
                >
                  <MdCached />
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/admin/edit-product/${product.id}`)
                  }
                  variant="outline"
                  size="icon"
                >
                  <BsPencilSquare />
                </Button>
                <Button
                  onClick={() => handleDelete(product.id, product.images)}
                  variant="outline"
                  size="icon"
                >
                  <MdDelete />
                </Button>
                <Button
                  onClick={() => router.push(`/product/${product.id}`)}
                  variant="outline"
                  size="icon"
                >
                  <MdRemoveRedEye />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
