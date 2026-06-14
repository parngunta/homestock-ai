import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: "bg-secondary text-secondary-foreground",
      primary: "bg-primary/12 text-primary",
      warning: "bg-warning/12 text-warning",
      danger: "bg-destructive/12 text-destructive",
      success: "bg-success/12 text-success",
      ghost: "bg-transparent text-muted-foreground border border-border",
    };

    const sizes = {
      sm: "px-2.5 py-1 text-xs rounded-full",
      md: "px-3 py-1.5 text-sm rounded-full",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-semibold transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
