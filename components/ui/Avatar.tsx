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
        "inline-flex shrink-0 select-none items-center justify-center font-medium tracking-tight text-white",
        isOrg ? "rounded-md" : "rounded-full",
        sizes[size],
        ring && "ring-2 ring-surface",
        className,
      )}
      style={{ background: `hsl(${hue} 28% 42%)` }}
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
        <span className={cn("-ml-2 inline-flex items-center justify-center rounded-full bg-canvas font-medium text-ink-2 ring-2 ring-surface", sizes[size])}>
          +{rest}
        </span>
      )}
    </span>
  );
}
