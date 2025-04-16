import { motion } from "motion/react";

export default function Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed w-full h-full text-center flex justify-center items-center"
    >
      <motion.img
        alt="fuse"
        src="/fuse.svg"
        animate={{
          scale: [1, 1.3, 1],
          transition: {
            duration: 0.7,
            repeat: Infinity,
          },
        }}
      />
    </motion.div>
  );
}
