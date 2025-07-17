import { AnimatePresence, motion } from "motion/react";

import { Input } from "~/components/ui/input";

export default function Field({
  error,
  label,
  ...props
}: React.ComponentProps<typeof motion.input> & {
  label?: string;
  error?: string;
}) {
  return (
    <label className="w-full relative flex flex-col gap-2">
      {label && (
        // TODO: Shine text
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className="text-xs text-muted-foreground"
        >
          {label}
        </motion.span>
      )}

      <motion.span
        initial={{ x: 0 }}
        animate={error ? { x: [-2, 2, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full flex flex-col gap-2"
      >
        <Input {...props} error={!!error} />
      </motion.span>

      <AnimatePresence>
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="absolute text-xs -bottom-5 text-destructive"
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </label>
  );
}
