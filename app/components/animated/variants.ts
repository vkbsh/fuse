import { Variants } from "motion/react";

export type Variant =
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
  fadeIn: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: { duration: 1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  },
  fadeInList: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: 15, opacity: 0 },
  },
  slideDown: {
    hidden: { y: -15, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -15, opacity: 0 },
  },
  slideDropdown: {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  },
  counter: {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: {
      y: 10,
      opacity: 0,
    },
  },
  slideDownModal: {
    hidden: { y: -35, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -35, opacity: 0 },
  },
  collapse: {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },
  blur: {
    hidden: { backdropFilter: "blur(0px)" },
    visible: { backdropFilter: "blur(8px)", transition: { duration: 1 } },
    exit: { backdropFilter: "blur(0px)", transition: { duration: 0.3 } },
  },
};
