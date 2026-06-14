import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  illustration?: React.ReactNode;
  icon?: React.ElementType;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({ illustration, icon: Icon, title, description, children, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("flex flex-col items-center text-center px-6 py-12", className)}
    >
      {illustration ? (
        <div className="mb-5">{illustration}</div>
      ) : Icon ? (
        <div className="w-20 h-20 rounded-3xl bg-secondary/70 flex items-center justify-center mb-5">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-title mb-2">{title}</h3>
      {description && (
        <p className="text-base text-muted-foreground mb-6 max-w-xs leading-relaxed">{description}</p>
      )}
      {children}
    </motion.div>
  );
}
