import { AccessDenied } from "@/components/access-denied";
import { AdminNavbar } from "./components/admin-navbar";
import { getCurrentUser } from "@/actions/get-current-user";

export const metadata = {
  title: "Store | Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  // ✅ So sánh role không phân biệt hoa/thường
  if (currentUser?.role?.toLowerCase() !== "admin") {
    return (
      <AccessDenied title="Bạn cần có quyền quản trị để xem trang này." />
    );
  }

  return (
    <div>
      <div>
        <AdminNavbar />
      </div>
      {children}
    </div>
  );
}
