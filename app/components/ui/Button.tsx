"use client";

import React from "react";
import { motion } from "motion/react";

import { cn } from "~/utils/tw";

type Size = "sm" | "md" | "lg" | "full";
type Variant = "primary" | "secondary" | "bordered" | "max";

const variants: { [key in Variant]: string } = {
  primary: "bg-black text-white",
  secondary: "bg-white text-black",
  bordered: "bg-black text-white ring-3 ring-[#BFBFBF] font-medium text-sm",
  max: "bg-white/30 text-white border-4 border-black/10 font-extrabold  text-xl",
};

const sizes: { [k in Size]: string } = {
  sm: "h-[40px] px-5",
  md: "w-[120px] h-[46px] px-6",
  full: "w-auto h-[46px]",
  lg: "h-[70px]",
};

const base =
  "font-bold flex items-center justify-center rounded-full gap-2 px-6 py-4 cursor-pointer";

const Button = ({
  onClick,
  children,
  size = "md",
  variant = "primary",
  ...props
}: {
  size?: Size;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  const className = cn(base, sizes[size], variants[variant], props.className);

  return (
    <motion.button
      whileHover={{
        scale: 1.02,
      }}
      {...props}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export default Button;
