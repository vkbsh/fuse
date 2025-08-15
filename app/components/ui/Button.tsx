import { forwardRef } from "react";
import { motion } from "motion/react";
import { cva } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap outline-none relative rounded-3xl font-semibold",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        secondary: "bg-promary text-primary-foreground border",
        outline: "bg-primary text-primary-foreground border",
        borderedMax:
          "bg-primary text-primary-foreground border-[3px] border-ring-dark font-bold",
        borderedWithIcon:
          "bg-primary text-primary-foreground border-[3px] border-ring text-sm font-medium",
      },
      size: {
        icon: "size-9",
        default: "h-[46px] px-6",
        borderedWithIcon: "h-[40px] px-4",
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
      children?: React.ReactNode;
      onClick?: (any: any) => void;
      size?: "default" | "icon" | "borderedWithIcon";
      variant?: "default" | "outline" | "secondary" | "borderedWithIcon";
    },
    forwardedRef: React.Ref<HTMLButtonElement>,
  ) => {
    const { size, variant, className, children, disabled, onClick, ...rest } =
      props;

    return (
      <motion.button
        ref={forwardedRef}
        disabled={disabled}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        whileHover={
          disabled
            ? undefined
            : {
                opacity: 0.85,
                scale: 1.02,
              }
        }
        transition={{ duration: 0.3 }}
        animate={{ opacity: disabled ? 0.6 : 1 }}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={onClick}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);

export { Button, buttonVariants };
