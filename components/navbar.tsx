import Link from "next/link";
import Image from "next/image";

import { Container } from "./ui/container";
import { CartCount } from "./cart-count";
import { UserMenu } from "./user-menu";
import { getCurrentUser } from "@/actions/get-current-user";
import { CategoriesNavbar } from "./categories-navbar";
import { ModeToggle } from "./mode-toggle";
import SearchBar from "./SearchBar";
import HideOnAdmin from "./hide-on-admin"; // 👈 thêm dòng này

export const Navbar = async () => {
  const currentUser = await getCurrentUser();

  return (
    <div className="sticky top-0 w-full z-50 shadow-sm bg-white dark:bg-black">
      <div className="py-4 border-b">
        <Container>
          <div className="flex items-center justify-between">
            <Link href={"/"}>
              <Image
                src="/logo.png"
                width={160}
                height={160}
                alt="G Cosmetic"
              />
            </Link>

            {/* Ẩn ô tìm kiếm khi ở /admin */}
            <HideOnAdmin>
              <div className="hidden md:block">
                <SearchBar />
              </div>
            </HideOnAdmin>

            <div className="flex items-center gap-x-4">
              {/* Ẩn nút giỏ hàng khi ở /admin */}
              <HideOnAdmin>
                <span>
                  <CartCount />
                </span>
              </HideOnAdmin>

              <span>
                <ModeToggle />
              </span>

              <span>
                <UserMenu currentUser={currentUser} />
              </span>
            </div>
          </div>
        </Container>
      </div>

      {/* Ẩn thanh danh mục khi ở /admin */}
      <HideOnAdmin>
        <CategoriesNavbar />
      </HideOnAdmin>
    </div>
  );
};
