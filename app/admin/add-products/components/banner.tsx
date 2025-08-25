// components/banner.tsx

interface BannerProps {
  category: string;
}

export const Banner: React.FC<BannerProps> = ({ category }) => {
  const bannerImages: Record<string, string> = {
    All: "/images/banner-all.jpg",
    Lipstick: "/images/banner-lipstick.jpg",
    MakeUp: "/images/banner-makeup.jpg",
    FaceCare: "/images/banner-facecare.jpg",
    BodyCare: "/images/banner-bodycare.jpg",
  };

  const imageUrl = bannerImages[category] || "/images/banner-default.jpg";

  return (
    <div className="w-full h-[250px] mb-10">
      <img
        src={imageUrl}
        alt={`Banner for ${category}`}
        className="w-full h-full object-cover rounded-xl shadow-md"
      />
    </div>
  );
};
