// app/product/components/AddRating.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Rating } from "@mui/material";

// Dựa vào Input/Button bạn đang dùng trong form khác.
// Nếu bạn dùng shadcn, hãy đổi sang:
//   import { Button } from "@/components/ui/button";
//   import { Input } from "@/components/ui/input";
// Ở đây mình dùng đúng kiểu Input “custom” của bạn (có register, errors, label)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReviewLite = {
  id: string;
  userId: string;
};

type ProductLite = {
  id: string;
  reviews?: ReviewLite[];
};

type OrderLite = {
  deliveryStatus?: string | null;
  status?: string | null;
  products?: any[]; // mảng CartProductType[]
};

type UserLite = {
  id: string;
  Order?: OrderLite[];
} | null;

interface AddRatingProps {
  product: ProductLite;
  user: UserLite; // truyền currentUser (có trường Order[]) vào đây
}

/** chuẩn hoá status */
function isPaid(s?: string | null) {
  if (!s) return false;
  const t = s.toString().trim().toLowerCase();
  return t === "paid" || t === "succeeded" || t === "complete" || t === "completed" || t === "success";
}
function isDelivered(s?: string | null) {
  if (!s) return false;
  return s.toString().trim().toLowerCase() === "delivered";
}

export default function AddRating({ product, user }: AddRatingProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  // Đã đăng nhập chưa?
  if (!user) return null;

  // Đã đánh giá sản phẩm này trước đó?
  const hasReviewed =
    Array.isArray(product?.reviews) &&
    product.reviews!.some((r) => r.userId === user.id);

  // Có đơn đã giao & đã thanh toán chứa sản phẩm này?
  const eligible =
    Array.isArray(user?.Order) &&
    user!.Order!.some((o) => {
      const hasProduct =
        Array.isArray(o.products) &&
        o.products!.some((p: any) => p?.id === product.id);
      return hasProduct && isDelivered(o.deliveryStatus) && isPaid(o.status);
    });

  // Nếu đã review hoặc chưa đủ điều kiện → ẩn form
  if (hasReviewed || !eligible) return null;

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const rating = Number(data.rating) || 0;
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao (1–5).");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post("/api/rating", {
        productId: product.id,
        rating,
        comment: data.comment ?? "",
      });

      if (res.status === 201) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        reset({ rating: 0, comment: "" });
        router.refresh();
      } else {
        toast.error(res.data?.error || "Không thể gửi đánh giá.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        (err?.response?.status === 401
          ? "Bạn cần đăng nhập."
          : "Có lỗi xảy ra khi gửi đánh giá.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl border rounded-xl p-4 space-y-3">
      <div className="font-semibold text-lg">Đánh giá sản phẩm này</div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Chọn số sao:</span>
        <Rating
          onChange={(e, newValue) => setValue("rating", newValue ?? 0, { shouldDirty: true })}
        />
      </div>

      <Input
        id="comment"
        label="Nhận xét (tuỳ chọn)"
        disabled={submitting}
        register={register}
        errors={errors}
      />

      <Button
        onClick={handleSubmit(onSubmit)}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
      </Button>

      <p className="text-xs text-gray-500">
        
      </p>
    </div>
  );
}
