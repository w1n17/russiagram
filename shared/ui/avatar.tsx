import Image from "next/image";
import { cn } from "@/shared/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  hasStory?: boolean;
  onClick?: () => void;
}

export function Avatar({
  src,
  alt,
  size = "md",
  className,
  hasStory,
  onClick,
}: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-[66px] h-[66px]",
    xl: "w-24 h-24",
  };

  const storyRingSize = {
    xs: "p-[1.5px]",
    sm: "p-[2px]",
    md: "p-[2px]",
    lg: "p-[2.5px]",
    xl: "p-[3px]",
  };

  const avatarContent = (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gray-200 flex items-center justify-center",
        sizes[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        <span className="text-gray-500 font-semibold text-xs uppercase">
          {alt.charAt(0)}
        </span>
      )}
    </div>
  );

  if (hasStory) {
    return (
      <div
        className={cn(
          "rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500",
          storyRingSize[size],
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <div className="bg-white rounded-full p-[2px]">{avatarContent}</div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className={onClick ? "cursor-pointer" : ""}>
      {avatarContent}
    </div>
  );
}
