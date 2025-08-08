"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { categories, colors } from "@/lib/products";
import { sizes } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ImSpinner2 } from "react-icons/im";
import toast from "react-hot-toast";
import firebase from "@/lib/firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import axios from "axios";
import { useRouter } from "next/navigation";
import { SizeInput } from "../../add-products/components/size-input";
import { CategoryInput } from "../../add-products/components/category-input";
import { EditColorInput } from "./edit-color-input";
import Image from "next/image";

interface EditProductFormProps {
  product: any;
}

export type ImageType = {
  color: string;
  colorCode: string;
  image: File | null;
};

export type UploadedImageType = {
  color: string;
  colorCode: string;
  image: string;
};

export const EditProductForm: React.FC<EditProductFormProps> = ({
  product,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<{
    [color: string]: File | string | null;
  }>(
    product.images.reduce(
      (acc: any, cur: any) => ({ ...acc, [cur.color]: cur.image }),
      {}
    )
  );

  const [selectedFiles, setSelectedFiles] = useState<{
    [color: string]: File | null;
  }>({});
  const [isProductCreated, setIsProductCreated] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      inStock: true,
      images: product.images,
      sizes: product.sizes,
    },
  });

  const category = watch("category");
  const selectedSizes = watch("sizes");

  const setCustomValue = useCallback(
    (id: string, value: any) => {
      setValue(id, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [setValue]
  );

  const handleSizeSelection = (selectedSizes: string[]) => {
    setValue("sizes", selectedSizes);
  };

  const addImageToState = useCallback((value: ImageType) => {
    setSelectedFiles((prev) => {
      return { ...prev, [value.color + "-" + value.colorCode]: value.image };
    });
  }, []);

  const removeImageFromState = useCallback((value: ImageType) => {
    setSelectedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[value.color + value.colorCode];
      return newFiles;
    });
  }, []);

  useEffect(() => {
    setCustomValue("images", images);
    console.log(images);
  }, [images, setCustomValue]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    let uploadedImages: UploadedImageType[] = product.images;

    if (!data.sizes || data.sizes.length === 0) {
      setIsLoading(false);
      toast.error("Phải chọn ít nhất một dung tích");
      setTimeout(() => setIsLoading(false), 5000);
      return;
    }

    if (!data.category) {
      setIsLoading(false);
      toast.error("Danh mục chưa được chọn");
      setTimeout(() => setIsLoading(false), 5000);
      return;
    }

    const handleImageUploads = async () => {
      toast("Đang cập nhật sản phẩm, vui lòng đợi...");
      try {
        for (const [key, item] of Object.entries(selectedFiles)) {
          if (item instanceof File) {
            const filename = new Date().getTime() + "-" + item.name;
            const [color, colorCode] = key.split("-");
            const storage = getStorage(firebase);
            const storageRef = ref(storage, `products/${filename}`);
            const uploadTask = uploadBytesResumable(storageRef, item);

            await new Promise<void>((resolve, reject) => {
              uploadTask.on(
                "state_changed",
                (snapshot) => {
                  const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log("Upload is " + progress + "% done");
                  switch (snapshot.state) {
                    case "paused":
                      console.log("Upload is paused");
                      break;
                    case "running":
                      console.log("Upload is running");
                      break;
                  }
                },
                (error) => {
                  console.log("Error uploading image...", error.message);
                  reject(error);
                },
                () => {
                  getDownloadURL(uploadTask.snapshot.ref)
                    .then((downloadURL) => {
                      uploadedImages.push({
                        color: color,
                        colorCode: colorCode,
                        image: downloadURL,
                      });
                      console.log("File available at", downloadURL);
                      resolve();
                    })
                    .catch((error) => {
                      console.log("Error getting Download URL", error);
                      reject(error);
                    });
                }
              );
            });
          }
        }
      } catch (error) {
        setIsLoading(false);
        console.log("Error handling image upload", error);
        return toast.error("Error handling image upload");
      }
    };

    await handleImageUploads();
    setIsLoading(false);

    const productData = { ...data, images: uploadedImages };

    axios
      .patch("/api/product", productData)
      .then(() => {
        toast.success("Đã cập nhật sản phẩm! 😊");
        setIsProductCreated(true);
        router.push(`/admin/manage-products`);
      })
      .catch((error) => {
        toast.error("Đã xảy ra lỗi! 😟");
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    setSelectedFiles({});
    reset();
    setIsLoading(false);
  };

  return (
    <>
      <h1 className="text-2xl mt-5 text-center font-semibold">Chỉnh sửa sản phẩm</h1>
      <Input
        id="name"
        label="Tên"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="price"
        label="Giá (VND)"
        type="number"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Textarea
        id="description"
        label="Mô tả"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Checkbox
        id="inStock"
        register={register}
        label="Sản phẩm này có trong kho"
      />

      <div className="w-full my-6">
        <span className="font-semibold">Chọn kích cỡ</span>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 max-h-[50vh] overflow-y-auto gap-3">
          <SizeInput
            sizes={sizes}
            selectedSizes={selectedSizes}
            onSizeSelection={handleSizeSelection}
          />
        </div>
      </div>

      <div className="w-full font-medium">
        <span className="font-semibold">Chọn danh mục</span>
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 max-h-[50vh] overflow-y-auto gap-3">
          {categories.map((item) => {
            if (item.label === "All") {
              return null;
            }

            return (
              <div key={item.icon} className="col-span">
                <CategoryInput
                  onClick={(category) => setCustomValue("category", category)}
                  selected={category === item.label}
                  label={item.label}
                  icon={item.icon}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full flex flex-col flex-wrap gap-4 my-4">
        <div className="flex flex-col">
          <span className="font-bold">
            Chọn loại sản phẩm có sẵn và tải lên hình ảnh của chúng.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {colors.map((item, index) => {
            return (
              <EditColorInput
                key={index}
                item={item}
                addImageToState={addImageToState}
                removeImageFromState={removeImageFromState}
                isProductCreated={isProductCreated}
                product={product}
              />
            );
          })}
        </div>
      </div>
      <Button type="submit" onClick={handleSubmit(onSubmit)} className="w-full">
        {isLoading ? <ImSpinner2 className="animate-spin" /> : "Cập nhật sản phẩm"}
      </Button>
    </>
  );
};
