import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = "md", ...props }, ref) => {
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const sizes = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-14 h-14 text-base",
      xl: "w-20 h-20 text-xl",
    };

    const colors = [
      "bg-emerald-100 text-emerald-700",
      "bg-sky-100 text-sky-700",
      "bg-amber-100 text-amber-700",
      "bg-rose-100 text-rose-700",
      "bg-violet-100 text-violet-700",
      "bg-orange-100 text-orange-700",
      "bg-cyan-100 text-cyan-700",
      "bg-lime-100 text-lime-700",
    ];

    const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const colorClass = colors[colorIndex];

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl font-semibold overflow-hidden flex-shrink-0",
          sizes[size],
          colorClass,
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
