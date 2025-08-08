"use client";

import { FieldValues, UseFormRegister } from "react-hook-form";

interface CheckboxProps {
  id: string;
  label: string;
  disabled?: boolean;
  checked?: boolean;
  register: UseFormRegister<FieldValues>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  disabled,
  register,
  checked,
}) => {
  return (
    <div className="w-full flex flex-row gap-2 items-center justify-center">
      <input
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
        placeholder=""
        id={id}
        disabled={disabled}
        {...register(id)}
        type="checkbox"
        checked={checked}
      />
      <label className="font-medium cursor-pointer capitalize" htmlFor={id}>
        {label}
      </label>
    </div>
  );
};
