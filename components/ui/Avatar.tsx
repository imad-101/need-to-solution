import { cn, initials } from "@/lib/utils";
import type { User } from "@/lib/types";

const sizes = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

export function Avatar({
  user,
  size = "md",
  className,
  ring,
}: {
  user: Pick<User, "name" | "avatarHue" | "role">;
  size?: keyof typeof sizes;
  className?: string;
  ring?: boolean;
}) {
  const hue = user.avatarHue;
  const isOrg = user.role === "organization";
  return (
    <span
      title={user.name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-semibold tracking-tight text-white",
        isOrg ? "rounded-xl" : "rounded-full",
        sizes[size],
        ring && "ring-2 ring-ink",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 75% 55%), hsl(${(hue + 50) % 360} 80% 45%))`,
        boxShadow: `0 6px 18px -8px hsl(${hue} 80% 55% / 0.7)`,
      }}
    >
      {initials(user.name)}
    </span>
  );
}

export function AvatarStack({ users, max = 4, size = "sm" }: { users: User[]; max?: number; size?: keyof typeof sizes }) {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <span className="inline-flex items-center">
      {shown.map((u, i) => (
        <span key={u.id} className={cn(i > 0 && "-ml-2")}>
          <Avatar user={u} size={size} ring />
        </span>
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "-ml-2 inline-flex items-center justify-center rounded-full bg-white/10 font-medium text-white/80 ring-2 ring-ink",
            sizes[size],
          )}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
