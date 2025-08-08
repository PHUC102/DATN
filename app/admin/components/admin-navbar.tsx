"use client";

import { Container } from "@/components/ui/container";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNavItem } from "./admin-navitem";
import { MdDashboard, MdLibraryAdd, MdOutlineRateReview } from "react-icons/md";
import { FaUser } from "react-icons/fa";

export const AdminNavbar = () => {
  const pathname = usePathname();
  return (
    <div className="w-full shadow border pt-4">
      <Container>
        <div className="flex flex-row items-center justify-between md:justify-center gap-8 md:gap-12 overflow-x-auto flex-nowrap">
          <Link href="/admin">
            <AdminNavItem
              label="Tóm tắt trang tổng quan"
              icon={MdDashboard}
              selected={pathname === "/admin"}
            />
          </Link>
          <Link href="/admin/add-products">
            <AdminNavItem
              label="Thêm sản phẩm"
              icon={MdLibraryAdd}
              selected={pathname === "/admin/add-products"}
            />
          </Link>
          <Link href="/admin/manage-products">
            <AdminNavItem
              label="Quản lý sản phẩm"
              icon={MdDashboard}
              selected={pathname === "/admin/manage-products"}
            />
          </Link>
          <Link href="/admin/manage-orders">
            <AdminNavItem
              label="Quản lý đơn hàng"
              icon={MdDashboard}
              selected={pathname === "/admin/manage-orders"}
            />
          </Link>
          <Link href="/admin/manage-user">
            <AdminNavItem
              label="Quản lý khách hàng"
              icon={FaUser}
              selected={pathname === "/admin/manage-user"}
            />
          </Link>
          <Link href="/admin/manage-review">
            <AdminNavItem
              label="Quản lý đánh giá"
              icon={MdOutlineRateReview}
              selected={pathname === "/admin/manage-review"}
            />
          </Link>
        </div>
      </Container>
    </div>
  );
};
