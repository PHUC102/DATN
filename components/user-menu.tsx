"use client";

import { SafeUser } from "@/types";
import { Menu, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Fragment } from "react";
import { AiFillCaretDown } from "react-icons/ai";
import { Avatar } from "./ui/avatar";

interface UserMenuProps {
  currentUser: SafeUser | null;
}

export const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md bg-gray-100 dark:bg-gray-600 px-4 py-2 text-sm font-medium hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
            <Avatar src={currentUser?.image} />
            <AiFillCaretDown
              className="ml-2 -mr-1 h-4 w-4"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {currentUser ? (
              <>
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={"/orders"}
                        className={`${active ? "bg-violet-500" : "dark:bg-black bg-white"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Đơn hàng của bạn
                      </Link>
                    )}
                  </Menu.Item>
                </div>
                {currentUser && currentUser.role === "ADMIN" ? (
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={"/admin"}
                          className={`${active ? "bg-violet-500" : "dark:bg-black bg-white"
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          Trang Quản trị viên
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                ) : null}

                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => signOut()}
                        className={`${active ? "bg-violet-500" : "dark:bg-black bg-white"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Đăng xuất
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </>
            ) : (
              <>
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={"/login"}
                        className={`${active ? "bg-violet-500" : "dark:bg-black bg-white"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Đăng nhập
                      </Link>
                    )}
                  </Menu.Item>
                </div>
                <div className="px-1 py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        href={"/register"}
                        className={`${active ? "bg-violet-500" : "dark:bg-black bg-white"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      >
                        Đăng ký
                      </Link>
                    )}
                  </Menu.Item>
                </div>
              </>
            )}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
