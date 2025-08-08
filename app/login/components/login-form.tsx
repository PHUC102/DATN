"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { ImSpinner2 } from "react-icons/im";
import toast from "react-hot-toast";
import { SafeUser } from "@/types";

interface LoginFormProps {
  currentUser: SafeUser | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    signIn("credentials", {
      ...data,
      redirect: false,
    }).then((callback) => {
      setIsLoading(false);
      if (callback?.ok) {
        router.push("/");
        router.refresh();
        toast.success("Đăng nhập thành công!");
      }

      if (callback?.error) {
        toast.error("Đăng nhập thất bại!");
      }
    });
  };

  useEffect(() => {
    if (currentUser) {
      router.push("/");
      router.refresh();
    }
  }, [currentUser, router]);

  if (currentUser) {
    return (
      <div className="text-3xl flex flex-col items-center justify-center w-full h-full gap-3">
        <h1>Đang đăng nhập...</h1>
        <h2>Chuyển hướng</h2>
        <ImSpinner2 className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl mt-5 text-center">Đăng nhập vào cửa hàng</h1>
      <Button
        disabled={isLoading}
        type="button"
        onClick={() => {
          signIn("google");
        }}
        variant={"outline"}
        className="w-full items-center flex gap-3"
      >
        <FcGoogle size={20} />
        Tiếp tục với Google
      </Button>
      <Separator />
      <Input
        id="email"
        label="Email"
        type="email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Button
        disabled={isLoading}
        type="submit"
        onClick={handleSubmit(onSubmit)}
        className="w-full"
      >
        {isLoading ? <ImSpinner2 className="animate-spin" /> : "Login"}{" "}
      </Button>
      <span className="text-sm my-3">
        Bạn chưa có tài khoản?{" "}
        <Link className="underline" href={"/register"}>
          Đăng ký
        </Link>
      </span>
    </>
  );
};
