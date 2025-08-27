// app/register/components/register-form.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { ImSpinner2 } from "react-icons/im";
import toast from "react-hot-toast";
import axios from "axios";

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, email, password, confirmPassword } = data;

    if (!name || !email || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post("/api/register", { name, email, password });

      if (res.status === 201 || res.data?.ok) {
        const mail = (res.data?.email || email).toString();
        // ➜ Chuyển sang trang thông báo, hiển thị rõ email
        const warn = res.data?.warn ? `&warn=${encodeURIComponent(res.data.warn)}` : "";
        router.push(`/verify-email/sent?email=${encodeURIComponent(mail)}${warn}`);
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
      } else {
        toast.error(res.data?.error || "Đăng ký thất bại");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        (err?.response?.status === 409 ? "Email này đã được đăng ký." : "Đăng ký thất bại");
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl mt-5 text-center">Tạo tài khoản</h1>

      <Separator />

      <Input id="name" label="Họ và tên" disabled={isLoading} register={register} errors={errors} required />

      <Input id="email" label="Email" type="email" disabled={isLoading} register={register} errors={errors} required />

      <Input id="password" label="Mật khẩu" type="password" disabled={isLoading} register={register} errors={errors} required />

      <Input
        id="confirmPassword"
        label="Nhập lại mật khẩu"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />

      <Button disabled={isLoading} type="submit" onClick={handleSubmit(onSubmit)} className="w-full">
        {isLoading ? <ImSpinner2 className="animate-spin" /> : "Đăng ký"}
      </Button>
    </>
  );
};
