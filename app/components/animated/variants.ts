import { Variants } from "motion/react";

export type Variant = "fadeIn" | "slideUp" | "slideDown" | "collapse" | "blur";

export const variants: { [key in Variant]: Variants } = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  slideDown: {
    hidden: { y: -15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -15, opacity: 0 },
  },
  collapse: {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },
  blur: {
    hidden: { backdropFilter: "blur(0px)" },
    visible: { backdropFilter: "blur(8px)" },
    exit: { backdropFilter: "blur(0px)" },
  },
};
