"use client";

import { Button } from "@/components/ui/button";
import { MdDelete, MdRemoveRedEye } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import moment from "moment";
import "moment/locale/vi";
moment.locale('vi');
interface ManageReviewClientProps {
  reviews: ExtendedReview[];
}

type ExtendedReview = {
  id: string;
  userId: string;
  productId: string;
  rating: number | null;
  comment: string | null;
};
interface User {
  name: string;
}
export const ManagerReviewClient: React.FC<ManageReviewClientProps> = ({
  reviews,
}) => {
  const router = useRouter();
  const handleDelete = async (reviewId: string) => {
    try {
      await axios.delete(`/api/review/${reviewId}`);

      toast.success("Đánh giá đã được xóa thành công");
      router.refresh();
    } catch (error) {
      toast.error("Không thể xóa đánh giá");
      console.error("Lỗi khi xóa đánh giá:", error);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-5 text-center font-semibold">Quản lý đánh giá</h1>
      <Table>
        <TableCaption className="text-center lg:text-right "></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Mã khách hàng</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>{review.userId}</TableCell>
              <TableCell>{review.rating} Sao</TableCell>
              <TableCell>{review.comment}</TableCell>

              <TableCell className="flex items-center justify-end gap-3">
                {/* <Button
                  onClick={() => {
                    // handleEdit(user.id);
                  }}
                  variant="outline"
                  size="icon"
                >
                  <BsPencilSquare />
                </Button> */}
                <Button
                  onClick={() => {
                    handleDelete(review.id);
                  }}
                  variant="outline"
                  size="icon"
                >
                  <MdDelete />
                </Button>
                <Button
                  onClick={() => router.push(`/product/${review.productId}`)}
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
