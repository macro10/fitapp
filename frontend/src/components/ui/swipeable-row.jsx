import { useRef, useState } from "react";
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
  const isDraggingRef = useRef(false);

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
        dragMomentum={false}
        onDragStart={() => {
          isDraggingRef.current = true;
        }}
        onDragEnd={(_, info) => {
          const x = info.offset.x;

          if (x <= -fullSwipeThreshold) {
            setOpen(false);
            onDelete?.();
          } else if (x <= -ACTION_WIDTH / 2) {
            setOpen(true);
          } else {
            setOpen(false);
          }

          // Keep the drag flag true just long enough to swallow the synthetic click
          setTimeout(() => {
            isDraggingRef.current = false;
          }, 150);
        }}
        onClickCapture={(e) => {
          if (isDraggingRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        animate={{ x: open ? -ACTION_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
}