import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function FloatingActionButton({ isOpen, onToggle, children, className }: FloatingActionButtonProps) {
  return (
    <div className={cn("fixed left-1/2 -translate-x-1/2 bottom-20 z-40 flex flex-col items-center gap-3", className)}>
      <motion.div
        initial={false}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20, pointerEvents: isOpen ? 'auto' : 'none' }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center gap-2 mb-2"
      >
        {children}
      </motion.div>
      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.92 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-14 h-14 rounded-full gradient-green text-white shadow-float flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={isOpen ? 'Close actions' : 'Open actions'}
        aria-expanded={isOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.button>
    </div>
  );
}

export function FabAction({ icon: Icon, label, onClick, color = "bg-card" }: { icon: React.ElementType; label: string; onClick: () => void; color?: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-card ${color} border border-border/30`}
    >
      <Icon className="w-5 h-5 text-foreground" />
      <span className="text-sm font-semibold whitespace-nowrap">{label}</span>
    </motion.button>
  );
}
