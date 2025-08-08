"use client";

import { useState, useEffect, useCallback } from "react";
import { ImageType } from "./add-product-form";
import { ImageInput } from "./image-input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ColorInputProps {
  item: ImageType;
  addImageToState: (value: ImageType) => void;
  removeImageFromState: (value: ImageType) => void;
  isProductCreated: boolean;
}

export const ColorInput: React.FC<ColorInputProps> = ({
  item,
  addImageToState,
  removeImageFromState,
  isProductCreated,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [file, setFile] = useState<File | null>();

  useEffect(() => {
    if (isProductCreated) {
      setIsSelected(false);
      setFile(null);
    }
  }, [isProductCreated]);

  const handleFileChange = useCallback(
    (value: File) => {
      setFile(value);
      addImageToState({ ...item, image: value });
    },
    [addImageToState, item]
  );

  const handleCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsSelected(e.target.checked);

      if (!e.target.checked) {
        setFile(null);
        removeImageFromState(item);
      }
    },
    [removeImageFromState, item]
  );

  return (
    <div className="grid grid-col-1 md:grid-cols-2 overflow-y-auto border-b border-slate-200 items-center p-2">
      <div className="flex flex-row gap-2 items-center h-[60px]">
        <input
          id={item.color}
          checked={isSelected}
          onChange={handleCheck}
          type="checkbox"
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
        />
        <label className="font-medium cursor-pointer" htmlFor={item.color}>
          {item.color}
        </label>
      </div>

      {isSelected && (
        <div className="col-span-2 text-center">
          <ImageInput item={item} handleFileChange={handleFileChange} />
        </div>
      )}

      {isSelected && file && (
        <div className="flex items-center gap-3">
          <Image
            src={URL.createObjectURL(file)}
            alt="Selected image"
            width={150}
            height={150}
          />
          <Button variant="destructive" size="sm" onClick={() => setFile(null)}>
            Hủy
          </Button>
        </div>
      )}
    </div>
  );
};
