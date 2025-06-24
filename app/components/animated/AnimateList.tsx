import { AnimatePresence } from "motion/react";

import Animate from "./Animate";
import { Variant } from "./variants";

export default function AnimateList({
  list,
  variant,
  className,
  ...rest
}: {
  variant: Variant;
  className?: string;
  list: React.ReactNode[];
}) {
  if (!list?.length) return null;

  return (
    <AnimatePresence>
      {list.map((item, i) => (
        <Animate
          layout
          key={i}
          variant={variant}
          viewport={{ once: true }}
          transition={{
            duration: 0.3,
            delay: i * 0.1,
          }}
          className={className}
          {...rest}
        >
          {item}
        </Animate>
      ))}
    </AnimatePresence>
  );
}
