"use client";

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface TextareaProps {
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

export const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  disabled,
  required,
  register,
  errors,
}) => {
  return (
    <div className="w-full relative">
      <textarea
        placeholder=""
        id={id}
        disabled={disabled}
        {...register(id, { required })}
        className={`peer w-full max-h-[150px] min-h-[150px] p-4 pt-6 outline-none border-2 rounded-md transition disabled:opacity-70 disabled:cursor-not-allowed bg-white dark:bg-gray-800 ${
          errors[id]
            ? "border-rose-400 focus:border-rose-400"
            : "border-slate-300 focus:border-slate-300"
        }`}
      />
      <label
        className={`absolute cursor-text text-md duration-150 transform -translate-y-3 top-5 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 ${
          errors[id] ? "text-rose-500" : "text-slate-500 dark:text-slate-200"
        }`}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};
