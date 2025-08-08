"use client";

import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
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
interface ManageUserClientProps {
  users: ExtendedUser[];
}

type ExtendedUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
};

export const ManagerUserClient: React.FC<ManageUserClientProps> = ({
  users,
}) => {
  const router = useRouter();

  const handleDelete = async (userId: string) => {
    try {
      await axios.delete(`/api/user/${userId}`);

      toast.success("Xóa người dùng thành công ");
      router.refresh();

    } catch (error) {
      toast.error("Không thể xóa người dùng");
      console.error("Lỗi khi xóa người dùng:", error);
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-5 text-center font-semibold">Quản lý khách hàng</h1>
      <Table>
        <TableCaption className="text-center lg:text-right "></TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tên khách hàng</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phân quyền</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>

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
                    handleDelete(user.id);
                  }}
                  variant="outline"
                  size="icon"
                >
                  <MdDelete />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
