interface FormWrapProps {
  children: React.ReactNode;
  className?: string;
}

export const FormWrap: React.FC<FormWrapProps> = ({ children, className }) => {
  return (
    <div
      className={`min-h-fit h-full flex items-center justify-center ${className}`}
    >
      <form className="max-w-[750px] lg:max-w-[80vw] w-full flex flex-col gap-6 items-center shadow-2xl rounded-md p-4 lg:p-8">
        {children}
      </form>
    </div>
  );
};
