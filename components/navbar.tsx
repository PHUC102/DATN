import Link from "next/link";

import { Container } from "./ui/container";
import { CartCount } from "./cart-count";
import { UserMenu } from "./user-menu";
import { getCurrentUser } from "@/actions/get-current-user";
import { CategoriesNavbar } from "./categories-navbar";
import { ModeToggle } from "./mode-toggle";
import Image from "next/image";
import SearchBar from "./SearchBar";

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
                alt="Picture of the author"
              />
            </Link>
            <div className="hidden md:block"><SearchBar /></div>
            <div className="flex items-center gap-x-4">
              <span>
                <CartCount />
              </span>
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
      <CategoriesNavbar />
    </div>
  );
};
