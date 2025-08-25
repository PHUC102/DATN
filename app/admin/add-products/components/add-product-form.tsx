"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { categories, colors } from "@/lib/products";
import { CategoryInput } from "./category-input";
import { SizeInput } from "./size-input";
import { sizes } from "@/lib/products";
import { ColorInput } from "./color-input";
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

export const AddProductForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageType[]>([]);
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
      name: "",
      description: "",
      price: "",
      category: "",
      inStock: true,
      images: [],
      sizes: [],
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
    setImages((prev) => {
      if (prev === undefined) {
        return [value];
      }

      return [...prev, value];
    });
  }, []);

  const removeImageFromState = useCallback((value: ImageType) => {
    setImages((prev) => {
      if (prev !== undefined) {
        const filteredImages = prev.filter(
          (item) => item.color !== value.color
        );
        return filteredImages;
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    setCustomValue("images", images);
  }, [images, setCustomValue]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    console.log("Product Data", data);
    setIsLoading(true);
    // Upload Images to FB
    let uploadedImages: UploadedImageType[] = [];

    if (!data.sizes || data.sizes.length === 0) {
      setIsLoading(true);
      toast.error("Phải chọn ít nhất một dung tích");
      setTimeout(() => setIsLoading(false), 5000);
      return;
    }

    if (!data.category) {
      setIsLoading(true);
      toast.error("Danh mục chưa được chọn");
      setTimeout(() => setIsLoading(false), 5000);
      return;
    }

    if (!data.images || data.images.length === 0) {
      setIsLoading(true);
      toast.error("Phải tải lên ít nhất một hình ảnh");
      setTimeout(() => setIsLoading(false), 5000);
      return;
    }

    const handleImageUploads = async () => {
      toast("Đang tạo sản phẩm, vui lòng đợi...");
      try {
        for (const item of data.images) {
          if (item.image) {
            const filename = new Date().getTime() + "-" + item.image.name;
            const storage = getStorage(firebase);
            const storageRef = ref(storage, `products/${filename}`);
            const uploadTask = uploadBytesResumable(storageRef, item.image);

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
                        ...item,
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
    setIsLoading(false); // Move this line here
    const productData = { ...data, images: uploadedImages };
    // Upload products to mongoDB
    axios
      .post("/api/product", productData)
      .then(() => {
        toast.success("Sản phẩm đã tạo! 😊");
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

    setImages([]);
    reset();
    setIsLoading(false);
  };

  return (
    <>
      <h1 className="text-2xl mt-5 text-center font-semibold">Thêm một sản phẩm</h1>
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
        <span className="font-semibold">Chọn dung tích</span>
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
              <div key={item.label} className="col-span">

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
              <ColorInput
                key={index}
                item={item}
                addImageToState={addImageToState}
                removeImageFromState={removeImageFromState}
                isProductCreated={isProductCreated}
              />
            );
          })}
        </div>
      </div>
      <Button type="submit" onClick={handleSubmit(onSubmit)} className="w-full">
        {isLoading ? <ImSpinner2 className="animate-spin" /> : "Thêm sản phẩm"}
      </Button>
    </>
  );
};
