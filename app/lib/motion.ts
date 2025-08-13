import {
  MotionNodeViewportOptions,
  MotionNodeAnimationOptions,
} from "motion/react";

type MotionProps = {
  exit: MotionNodeAnimationOptions["exit"];
  initial: MotionNodeAnimationOptions["initial"];
  animate: MotionNodeAnimationOptions["animate"];
  transition: MotionNodeAnimationOptions["transition"];
  whileInView?: MotionNodeViewportOptions["whileInView"];
};

export const fadeInListItemProps = (index: number): MotionProps => ({
  initial: { opacity: 0, y: -5 },
  exit: { opacity: 0, y: -5 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: index * 0.06 },
});

const defaultTransition = { duration: 0.4 };

const motionProps = {
  fadeIn: {
    transition: defaultTransition,
    initial: { opacity: 0 },
    exit: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInView: {
    transition: defaultTransition,
    initial: {
      opacity: 0,
      filter: "blur(6px)",
    },
    whileInView: {
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      filter: "blur(6px)",
    },
  },
  slideDownDialog: {
    initial: { y: -20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, type: "easeIn" },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.4, type: "easeOut" },
    },
  },
  slideDownDropdown: {
    initial: { y: -5, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, type: "easeIn" },
    },
    exit: {
      y: -5,
      opacity: 0,
      transition: { duration: 0.4, type: "easeOut" },
    },
  },
  blurOverlay: {
    initial: {
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)",
    },
    animate: {
      backdropFilter: "blur(6px)",
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.6, type: "easeIn" },
    },
    exit: {
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      transition: { duration: 0.4, type: "easeOut" },
    },
  },
};

type MotionPropName = {
  [K in keyof typeof motionProps]: MotionProps;
};

export default motionProps as MotionPropName;
