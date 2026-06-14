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
      primary: "bg-primary/10 text-primary dark:bg-primary/20",
      warning: "bg-warning/10 text-warning dark:bg-warning/20",
      danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
      success: "bg-success/10 text-success dark:bg-success/20",
      ghost: "bg-transparent text-muted-foreground border border-border",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full font-medium transition-colors",
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