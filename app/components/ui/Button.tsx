"use client";

import React, { forwardRef } from "react";
import { motion } from "motion/react";

import { cn } from "~/utils/tw";

type Size = "sm" | "md" | "lg" | "full";
type Variant = "primary" | "secondary" | "bordered" | "max" | "cancel";

const variants: { [key in Variant]: string } = {
  primary: "bg-black text-white",
  secondary: "bg-white text-black",
  cancel: "bg-white/20 text-white border border-white/20",
  bordered:
    "bg-black text-white ring-3 ring-[#BFBFBF] font-medium text-sm w-[126px]",
  max: "bg-white/30 text-white border-4 border-black/20 font-extrabold text-base",
};

const sizes: { [k in Size]: string } = {
  sm: "h-[40px] px-5",
  md: "w-[120px] h-[46px] px-6",
  full: "w-auto h-[46px]",
  lg: "h-[70px]",
};

const base =
  "font-bold flex items-center justify-center rounded-full gap-2 px-6 py-4 cursor-pointer";

const Button = forwardRef(
  (
    {
      onClick,
      children,
      size = "md",
      variant = "primary",
      className,
      disabled,
      ...props
    }: {
      size?: Size;
      variant?: Variant;
      disabled?: boolean;
      className?: string;
      onClick?: () => void;
      children: React.ReactNode;
    },
    ref: React.Ref<HTMLButtonElement>,
  ) => {
    const clsName = cn(base, sizes[size], variants[variant], className, {
      "opacity-50 cursor-not-allowed": disabled,
    });

    return (
      <motion.button
        ref={ref}
        whileHover={{
          scale: 1.02,
        }}
        {...props}
        onClick={disabled ? undefined : onClick}
        className={clsName}
      >
        {children}
      </motion.button>
    );
  },
);

export default Button;
