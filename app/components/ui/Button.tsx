import { forwardRef } from "react";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";

import { cn } from "~/lib/utils";
import { ShineBorder } from "~/components/ui/animated/shine-border";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium shrink-0 outline-none relative",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs",
        destructive: "bg-destructive text-white shadow-xs",
        outline: "border bg-background shadow-xs",
        secondary: "bg-secondary text-secondary-foreground shadow-xs",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

const Button = forwardRef(
  (
    props: {
      className?: string;
      disabled?: boolean;
      onClick?: () => void;
      children?: React.ReactNode;
      size?: "default" | "sm" | "lg" | "icon";
      variant?: "default" | "destructive" | "outline" | "secondary";
    },
    forwardedRef: React.Ref<HTMLButtonElement>,
  ) => {
    const { size, variant, className, children, disabled, onClick, ...rest } =
      props;

    return (
      <motion.button
        ref={forwardedRef}
        disabled={disabled}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        whileHover={
          disabled
            ? undefined
            : {
                opacity: 0.7,
              }
        }
        animate={{ opacity: disabled ? 0.5 : 1 }}
        transition={{ duration: 0.4 }}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={onClick}
        {...rest}
      >
        <ShineBorder />
        {children}
      </motion.button>
    );
  },
);

export { Button, buttonVariants };
