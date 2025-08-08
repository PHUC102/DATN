"use client"
import Link from "next/link";
import { Container } from "./ui/container";
import FooterList from "./FooterList";
import { MdFacebook } from "react-icons/md";
import {
  AiFillTwitterCircle,
  AiFillInstagram,
  AiFillYoutube,
} from "react-icons/ai";
import { BiLogoInstagram, BiLogoFacebook, BiLogoTwitter } from "react-icons/bi";
import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();
  const isNotAdminPath = !pathname?.startsWith('/admin');
  return (
    <>
      {isNotAdminPath && (
        <div className="bg-slate-700 text-slate-200 text-sm mt-16">
          <Container>
            <div className="flex flex-col md:flex-row justify-between pt-16 pb-8">
              <FooterList>
                <h3 className="text-base font-bold mb-2">Danh mục cửa hàng</h3>
                <Link href="Lipstick">Lipstick</Link>
                <Link href="MakeUp">MakeUp</Link>
                <Link href="FaceCare">FaceCare</Link>
                <Link href="BodyCare">BodyCare</Link>
              </FooterList>
              <FooterList>
                <h3 className="text-base font-bold mb-2">Dịch vụ khách hàng</h3>
                <Link href="#">Liên hệ chúng tôi</Link>
                <Link href="#">Chính sách vận chuyển</Link>
                <Link href="#">Hoàn hàng & Đổi trả</Link>
                <Link href="#">Câu hỏi thường gặp</Link>
              </FooterList>
              <div className="w-full md:w-1/3 mb-6 md:mb-0">
                <h3 className="text-base font-bold mb-2">Về chúng tôi</h3>
                <p className="mb-2">
                  Tại cửa hàng của chúng tôi, chúng tôi tận tâm cung cấp các sản phẩm và phụ kiện mới nhất và tốt nhất cho khách hàng.
                  Với nhiều lựa chọn về Son, Trang điểm, Chăm sóc mặt và Chăm sóc cơ thể.
                </p>
                <p>&copy; {new Date().getFullYear()} G Cosmetic. Đã đăng ký Bản quyền</p>
              </div>
              <FooterList>
                <h3 className="text-base font-bold mb-2">Theo dõi chúng tôi</h3>
                <div className="flex gap-2">
                  <Link href="#">
                    <MdFacebook size={24} />
                  </Link>
                  <Link href="#">
                    <AiFillTwitterCircle size={24} />
                  </Link>
                  <Link href="#">
                    <AiFillInstagram size={24} />
                  </Link>
                  <Link href="#">
                    <AiFillYoutube size={24} />
                  </Link>
                </div>
              </FooterList>
            </div>
          </Container>
        </div>
      )}
      <div className="sticky bottom-0 flex items-center justify-between p-5 border-t bg-white dark:bg-black h-14">
        <p className="text-sm">&copy; Phạm Đăng Phúc</p>
        <ul className="flex items-center gap-3">
          <li>
            <Link href="#">
              <BiLogoInstagram size={20} />
            </Link>
          </li>
          <li>
            <Link href="#">
              <BiLogoFacebook size={20} />
            </Link>
          </li>
          <li>
            <Link href="#">
              <BiLogoTwitter size={20} />
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

