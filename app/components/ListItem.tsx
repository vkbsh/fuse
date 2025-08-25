import { motion } from "motion/react";

import motionProps, { fadeInListItemProps } from "~/lib/motion";

export default function ListItem({
  index,
  disabled,
  children,
  onClick,
}: {
  index: number;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: (any: any) => void;
}) {
  return (
    <motion.button {...fadeInListItemProps(index)} onClick={onClick}>
      <motion.div
        className="h-16 p-3 rounded-2xl"
        {...(disabled ? {} : motionProps.listItem)}
      >
        {children}
      </motion.div>
    </motion.button>
  );
}
