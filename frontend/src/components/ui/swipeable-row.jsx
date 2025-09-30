import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const ACTION_WIDTH = 96; // px

export function SwipeableRow({
  children,
  onDelete,
  actionLabel = "Delete",
  className,
  // full swipe will fire onDelete automatically; the button also calls it
  fullSwipeThreshold = ACTION_WIDTH * 1.5,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn("relative select-none touch-pan-y overflow-hidden", className)}
      onClick={() => {
        if (open) {
          setOpen(false);
        }
      }}
    >
      {/* Actions layer (behind) */}
      <div className="absolute inset-y-0 right-0 flex items-stretch pr-2 sm:hidden">
        <button
          type="button"
          className="my-2 h-[calc(100%-1rem)] w-20 rounded-lg bg-destructive text-destructive-foreground font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:opacity-90"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onDelete?.();
          }}
          aria-label={actionLabel}
        >
          {actionLabel}
        </button>
      </div>

      {/* Foreground (draggable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.04}
        onDragEnd={(_, info) => {
          const x = info.offset.x;
          if (x <= -fullSwipeThreshold) {
            setOpen(false);
            onDelete?.();
            return;
          }
          if (x <= -ACTION_WIDTH / 2) {
            setOpen(true);
          } else {
            setOpen(false);
          }
        }}
        animate={{ x: open ? -ACTION_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        onPointerDownCapture={() => {
          // tapping the row while open should not re-close before click lands
          // let onClick above handle close
        }}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
}