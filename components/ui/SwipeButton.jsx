"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

export default function SwipeButton({
  onSwipeComplete,
  isLoading = false,
  label = "Swipe to Submit",
}) {
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [0, 250], [0, 1]); // Adjust 250 based on button width - padding
  const [isCompleted, setIsCompleted] = useState(false);

  const handleDragEnd = (event, info) => {
    if (isLoading || isCompleted) return;

    if (info.offset.x > 200) {
      setIsCompleted(true);
      onSwipeComplete(() => {
        setIsCompleted(false);
        animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
      });
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    }
  };

  return (
    <div
      className="relative w-full h-14 bg-[#4a5f36] bg-[url('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center rounded-full overflow-hidden shadow-lg mt-4 select-none"
      ref={constraintsRef}
    >
      <div className="absolute inset-0 bg-black/40 z-0"></div>
      {/* Text Label */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <span className="text-white font-medium opacity-80">
          {isLoading ? "Processing..." : label}
        </span>
      </div>

      {/* Draggable Circle */}
      <motion.div
        className="absolute top-1 left-1 bottom-1 w-12 h-12 bg-[#ccff00] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-md"
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        ) : (
          <ArrowRight className="w-5 h-5 text-black" />
        )}
      </motion.div>
    </div>
  );
}
