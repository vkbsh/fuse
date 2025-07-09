import { Variants } from "motion/react";

export type Variant =
  | "default"
  | "blur"
  | "fadeIn"
  | "slideUp"
  | "counter"
  | "collapse"
  | "slideDown"
  | "fadeInList"
  | "slideDropdown"
  | "slideDownModal";

export const variants: { [key in Variant]: Variants } = {
  default: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeIn: {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },
  fadeInList: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 15, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 15, opacity: 0 },
  },
  slideDown: {
    initial: { y: -15, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -15, opacity: 0 },
  },
  slideDropdown: {
    initial: { y: -10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  },
  counter: {
    initial: { y: -10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: {
      y: 10,
      opacity: 0,
    },
  },
  slideDownModal: {
    initial: { y: -35, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -35, opacity: 0 },
  },
  collapse: {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },
  blur: {
    initial: { backdropFilter: "blur(0px)" },
    animate: { backdropFilter: "blur(8px)", transition: { duration: 0.6 } },
    exit: { backdropFilter: "blur(0px)", transition: { duration: 0.3 } },
  },
};

export const useAnimationProps = (variantName: Variant = "default") => {
  return {
    exit: "exit",
    initial: "initial",
    animate: "animate",
    variants: variants[variantName],
  };
};
