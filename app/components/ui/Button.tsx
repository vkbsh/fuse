import React from "react";

import { cn } from "~/utils/tw";

type Size = "sm" | "md" | "lg" | "full";
type Variant = "primary" | "secondary" | "bordered" | "max" | "cancel";

const variants: { [key in Variant]: string } = {
  primary: "bg-black text-white",
  secondary: "bg-white text-black",
  cancel: "bg-white-20 text-white border border-white-20",
  bordered: "bg-black text-white ring-3 ring-ring-button font-medium text-sm",
  max: "bg-white-30 text-white border-4 border-black-20 font-extrabold text-base",
};

const sizes: { [k in Size]: string } = {
  sm: "h-[40px] px-5",
  md: "w-auto h-[46px] px-6",
  lg: "h-[70px]",
  full: "h-[46px]",
};

const base =
  "font-bold flex items-center justify-center rounded-full gap-2 px-6 py-4 cursor-pointer duration-500 hover:scale-105";

export default function Button({
  onClick,
  children,
  disabled,
  className,
  size = "md",
  variant = "primary",
  ...props
}: {
  size?: Size;
  variant?: Variant;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const clsName = cn(base, sizes[size], variants[variant], className, {
    "opacity-50 hover:scale-100": disabled,
  });

  return (
    <button
      {...props}
      onClick={onClick}
      className={clsName}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}
