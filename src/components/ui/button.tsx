import { motion } from "motion/react";
import { type ReactNode, type ComponentProps } from "react";

import { cn } from "~/lib/utils";

const variants = {
  default: "bg-secondary text-secondary-foreground",
  secondary: "bg-white/10 text-primary-foreground",
  outline: "bg-primary text-primary-foreground",
};

export type ButtonVariant = keyof typeof variants;

const sizes = {
  icon: "size-9",
  default: "h-[46px] px-8 min-w-[120px]",
};

export default function Button({
  size = "default",
  variant = "default",
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: ComponentProps<typeof motion.button> & {
  disabled?: boolean;
  children: ReactNode;
  size?: keyof typeof sizes;
  variant?: ButtonVariant;
  onClick?: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "inline-flex font-semibold items-center justify-center gap-2 whitespace-nowrap outline-transparent rounded-4xl border border-white/10 hover:scale-105 duration-300 transition-all",
        disabled && "opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
