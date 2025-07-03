import { AnimatePresence, motion } from "motion/react";

import Animate from "~/components/animated/Animate";

export default function AnimateString({ string }: { string: string }) {
  const roundedAmounArray = String(string).split("");

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div layout className="flex flex-row">
        {roundedAmounArray.map((value, i) => (
          <Animate
            layout
            variant="counter"
            key={i + "-" + value}
            transition={{ delay: i * 0.05 }}
          >
            {value}
          </Animate>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
