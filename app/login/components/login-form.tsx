// app/login/components/login-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const sp = useSearchParams();

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

  // Hiển thị banner khi xác thực email xong hoặc đổi mật khẩu xong (nếu bạn redirect kèm query)
  const verified = sp?.get("verified") === "1";
  const resetOk = sp?.get("reset") === "1";

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);
    signIn("credentials", { ...data, redirect: false }).then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
        toast.success("Đăng nhập thành công!");
        router.push("/");
        router.refresh();
        return;
      }

      // Hiển thị lỗi có ý nghĩa hơn
      if (callback?.error === "EMAIL_NOT_VERIFIED") {
        toast.error("Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư.");
      } else if (callback?.error === "CredentialsSignin") {
        toast.error("Email hoặc mật khẩu không đúng.");
      } else if (callback?.error) {
        toast.error(callback.error);
      } else {
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
      {/* Banner trạng thái */}
      {verified && (
        <div className="mb-3 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          Xác thực email thành công! Bạn có thể đăng nhập.
        </div>
      )}
      {resetOk && (
        <div className="mb-3 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          Đổi mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.
        </div>
      )}

      <h1 className="text-2xl md:text-3xl mt-5 text-center">Đăng nhập vào cửa hàng</h1>

      <Button
        disabled={isLoading}
        type="button"
        onClick={() => signIn("google")}
        variant={"outline"}
        className="w-full items-center flex gap-3 mt-3"
      >
        <FcGoogle size={20} />
        Tiếp tục với Google
      </Button>

      <Separator className="my-4" />

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

      {/* Link Quên mật khẩu? */}
      <div className="w-full mt-1 mb-4">
  <Link
    href="/forgot-password"
    className="block text-right pr-2 text-sm text-blue-600 hover:underline"
  >
    Quên mật khẩu?
  </Link>
</div>

      <Button
        disabled={isLoading}
        type="submit"
        onClick={handleSubmit(onSubmit)}
        className="w-full"
      >
        {isLoading ? <ImSpinner2 className="animate-spin" /> : "Login"}
      </Button>

      <span className="text-sm my-3 block text-center">
        Bạn chưa có tài khoản?{" "}
        <Link className="underline" href={"/register"}>
          Đăng ký
        </Link>
      </span>
    </>
  );
};
