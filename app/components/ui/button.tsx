import { motion } from "motion/react";

import { cn } from "~/lib/utils";
import { buttonMotionProps } from "~/lib/motion";

const variants = {
  default: "bg-secondary text-secondary-foreground",
  secondary: "bg-primary text-primary-foreground border",
  outline: "bg-primary text-primary-foreground border",
};

const sizes = {
  icon: "size-9",
  default: "h-[46px] px-6",
};

export function Button({
  size = "default",
  variant = "default",
  className,
  children,
  disabled,
  onClick,
  ...rest
}: React.ComponentProps<typeof motion.button> & {
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap outline-none relative rounded-3xl font-semibold",
        variants[variant],
        sizes[size],
        className,
      )}
      {...buttonMotionProps(!!disabled)}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
