import { Users } from "lucide-react";

interface GroupAvatarProps {
  photoURL?: string;
  size?: number;
  className?: string;
}

// Group identity avatar: shows the uploaded group photo, or a generated
// Users icon over the brand gradient as the fallback.
export function GroupAvatar({ photoURL, size = 40, className = "" }: GroupAvatarProps) {
  const style = { width: size, height: size };

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt="Group"
        style={style}
        className={`rounded-full object-cover flex-shrink-0 border-2 border-tsismis-border ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`rounded-full bg-tsismis-gradient flex items-center justify-center text-white flex-shrink-0 border-2 border-tsismis-border ${className}`}
    >
      <Users size={Math.round(size * 0.45)} />
    </div>
  );
}
