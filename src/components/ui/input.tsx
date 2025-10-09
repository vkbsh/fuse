import { motion } from "motion/react";

import { cn } from "~/lib/utils";

type InputProps = React.ComponentProps<typeof motion.input> & {
  error?: string;
  disabled?: boolean;
  className?: string;
};

export default function Input({ className, error, ...rest }: InputProps) {
  return (
    <motion.input
      tabIndex={-1}
      data-slot="input"
      spellCheck="false"
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      autoFocus={false}
      transition={{
        duration: 0.3,
      }}
      initial={{ borderColor: "var(--color-input-border)" }}
      animate={{
        x: error ? [-3, 3, -3, 3, -3, 0] : 0,
        color: error ? "var(--color-destructive)" : "var(--color-secondary)",
        borderColor: error
          ? "var(--color-destructive)"
          : "var(--color-input-border)",
      }}
      whileFocus={{
        borderColor: "var(--color-input-border-focus)",
      }}
      className={cn(
        "flex h-14 w-full min-w-0 rounded-2xl outline-none border-1 text-secondary text-sm indent-4",
        className,
      )}
      {...rest}
    />
  );
}
