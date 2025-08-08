"use client";

interface SizeInputProps {
  sizes: { label: string }[];
  selectedSizes: string[];
  onSizeSelection: (selectedSizes: string[]) => void;
}

export const SizeInput: React.FC<SizeInputProps> = ({
  sizes,
  selectedSizes,
  onSizeSelection,
}) => {
  const handleSizeToggle = (size: string) => {
    const updatedSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onSizeSelection(updatedSizes);
  };

  return (
    <>
      {sizes.map((size) => (
        <div
          key={size.label}
          onClick={() => handleSizeToggle(size.label)}
          className={`rounded-xl border-2 p-4 flex flex-col items-center gap-2 hover:border-slate-500 transition cursor-pointer
          ${
            selectedSizes.includes(size.label)
              ? "border-slate-500"
              : "border-slate-200"
          }`}
        >
          <span className="font-medium">{size.label}</span>
        </div>
      ))}
    </>
  );
};
