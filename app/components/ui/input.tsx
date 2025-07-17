import { motion } from "motion/react";
import { forwardRef, Ref } from "react";

import { cn } from "~/lib/utils";

type InputProps = React.ComponentProps<typeof motion.input> & {
  error?: boolean;
  disabled?: boolean;
  className?: string;
};

const Input = forwardRef((props: InputProps, ref: Ref<HTMLInputElement>) => {
  const { className, error, ...rest } = props;
  return (
    <motion.input
      ref={ref}
      type="text"
      tabIndex={-1}
      data-slot="input"
      spellCheck="false"
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      autoFocus={false}
      transition={{ duration: 0.3 }}
      whileFocus={{
        borderColor: "var(--color-foreground)",
      }}
      animate={{
        borderColor: error ? "var(--color-destructive)" : "var(--color-ring)",
      }}
      className={cn(
        "placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md px-3 py-1 border border-ring outline-none disabled:pointer-events-none text-sm",
        className,
      )}
      {...rest}
    />
  );
});

export { Input };
