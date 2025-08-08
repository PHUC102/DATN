"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { ImSpinner2 } from "react-icons/im";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SafeUser } from "@/types";

interface RegisterFormProps {
  currentUser: SafeUser | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    axios
      .post("/api/register", data)
      .then(() => {
        toast.success("Tạo tài khoản thành công!");
        signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        }).then((callback) => {
          if (callback?.ok) {
            router.push("/");
            router.refresh();
            toast.success("Đã đăng nhập!");
          }

          if (callback?.error) {
            toast.error(callback?.error);
          }
        });
      })
      .catch(() => toast.error("Đã xảy ra lỗi!"))
      .finally(() => setIsLoading(false));
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
        <h1>Đã đăng nhập...</h1>
        <h2>Chuyển hướng</h2>
        <ImSpinner2 className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl md:text-3xl mt-5 text-center">
        Đăng ký
      </h1>
      <Button
        type="button"
        onClick={() => {
          signIn("google");
        }}
        variant={"outline"}
        className="w-full items-center flex gap-3"
      >
        <FcGoogle size={20} />
        Đăng ký với Google
      </Button>
      <Separator />
      <Input
        id="name"
        label="Name"
        type="text"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
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
      <Button type="submit" onClick={handleSubmit(onSubmit)} className="w-full">
        {isLoading ? <ImSpinner2 className="animate-spin" /> : "Register"}{" "}
      </Button>
      <span className="text-sm my-3">
        Bạn đã có tài khoản?{" "}
        <Link className="underline" href={"/login"}>
          Đăng nhập
        </Link>
      </span>
    </>
  );
};
