import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Trash2Icon } from "lucide-react";

const ACTION_WIDTH = 96; // px

export function SwipeableRow({
  children,
  onDelete,
  actionLabel = "Delete",
  className,
  fullSwipeThreshold = ACTION_WIDTH * 1.5,
}) {
  const [open, setOpen] = useState(false);
  const isDraggingRef = useRef(false);

  // Enable swipe only on mobile (Tailwind sm breakpoint < 640px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 639px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange);
    return () => {
      mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange);
    };
  }, []);

  return (
    <div
      className={cn("relative select-none touch-pan-y overflow-hidden", className)}
      onClick={() => {
        if (open) setOpen(false);
      }}
    >
      {/* Actions layer (behind) - hidden on >= sm */}
      <div className="absolute inset-y-0 right-0 flex items-stretch pr-2 sm:hidden">
        <button
          type="button"
          className="my-2 h-[calc(100%-1rem)] w-20 rounded-lg bg-destructive text-destructive-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:opacity-90 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
            onDelete?.();
          }}
          aria-label={actionLabel}
        >
          <Trash2Icon className="h-5 w-5" />
        </button>
      </div>

      {/* Foreground (draggable) */}
      <motion.div
        drag={isMobile ? "x" : false}
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={0.04}
        dragMomentum={false}
        dragSnapToOrigin
        onDragStart={() => {
          if (!isMobile) return;
          isDraggingRef.current = true;
        }}
        onDragEnd={(_, info) => {
          if (!isMobile) return;

          const x = info.offset.x;
          if (x <= -fullSwipeThreshold) {
            setOpen(false);
            onDelete?.();
          } else {
            // Always snap closed after releasing drag
            setOpen(false);
          }

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