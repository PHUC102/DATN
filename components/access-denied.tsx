interface AccessDeniedProps {
  title: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ title }) => {
  return (
    <div className="w-full h-[50vh] flex items-center justify-center text-2xl md:text-3xl">
      <p className="font-semibold">{title}</p>
    </div>
  );
};
