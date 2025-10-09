import { motion } from "motion/react";

import motionProps from "~/lib/motion";

export default function ListItem({
  index,
  onClick,
  children,
}: {
  index: number;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      {...motionProps.global.fadeIn}
      transition={{ duration: 0.6, delay: index * 0.08 }}
    >
      <div className="h-16 p-3 rounded-2xl bg-hover/0 hover:bg-hover/24 duration-300 transition-colors">
        {children}
      </div>
    </motion.button>
  );
}
