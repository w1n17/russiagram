import Link from "next/link";
import { Avatar } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { Profile } from "@/shared/types";
import { ROUTES } from "@/shared/lib/constants";

interface UserCardProps {
  user: Profile;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
}

export function UserCard({
  user,
  showFollowButton = true,
  isFollowing = false,
  onFollowToggle,
}: UserCardProps) {

  return (
    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <Link
        href={ROUTES.PROFILE(user.username)}
        className="flex items-center gap-3 flex-1"
      >
        <Avatar src={user.avatar_url} alt={user.username} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-sm truncate">{user.username}</p>
            {user.is_verified && (
              <svg
                className="w-4 h-4 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{user.full_name}</p>
        </div>
      </Link>
      {showFollowButton && onFollowToggle && (
        <Button
          variant={isFollowing ? "secondary" : "primary"}
          size="sm"
          onClick={onFollowToggle}
        >
          {isFollowing ? "Отписаться" : "Подписаться"}
        </Button>
      )}
    </div>
  );
}
