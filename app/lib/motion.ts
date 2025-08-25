import {
  MotionNodeOptions,
  MotionNodeViewportOptions,
  MotionNodeAnimationOptions,
} from "motion/react";

type MotionProps = {
  initial: MotionNodeAnimationOptions["initial"];
  exit: MotionNodeAnimationOptions["exit"];
  animate: MotionNodeAnimationOptions["animate"];
  whileHover?: MotionNodeOptions["whileHover"];
  whileInView?: MotionNodeViewportOptions["whileInView"];
  transition: MotionNodeAnimationOptions["transition"];
};

const duration = 0.3;
const transition = { duration };

export const fadeInListItemProps = (index: number): MotionProps => ({
  initial: { opacity: 0, y: -15 },
  exit: { opacity: 0, y: -15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay: index * 0.08 },
});

export const buttonMotionProps = (disabled: boolean): MotionProps => ({
  initial: { opacity: 1 },
  exit: { opacity: 0 },
  animate: { opacity: disabled ? 0.5 : 1 },
  whileHover: disabled ? undefined : { opacity: 0.9, scale: 1.02 },
  transition: { duration },
});

const motionProps = {
  fadeIn: {
    transition,
    initial: { opacity: 0 },
    exit: { opacity: 0 },
    animate: { opacity: 1 },
  },
  fadeInView: {
    transition,
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
  listItem: {
    whileHover: {
      backgroundColor: "rgba(179, 179, 179, 0.25)",
    },
    transition: { duration },
  },
  dropdown: {
    initial: { y: -5, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration, type: "easeIn" },
    },
    exit: {
      y: -5,
      opacity: 0,
      transition: { duration, type: "easeOut" },
    },
  },
  dialog: {
    overlay: {
      initial: {
        backdropFilter: "blur(0px)",
      },
      animate: {
        backdropFilter: "blur(6px)",
        transition: { duration, type: "easeIn" },
      },
      exit: {
        backdropFilter: "blur(0px)",
        transition: { duration, type: "easeOut" },
      },
    },
    content: {
      initial: { y: -20, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: { duration, type: "easeIn" },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: { duration, type: "easeOut" },
      },
    },
    close: {
      initial: { y: -20, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: { duration, type: "easeIn" },
      },
      exit: {
        y: -20,
        opacity: 0,
        transition: { duration, type: "easeOut" },
      },
    },
  },
  connect: {
    logo: {
      initial: { opacity: 0, y: -25, scale: 2 },
      animate: { opacity: 1, y: 1, rotateZ: -45, rotateX: 50, scale: 1.3 },
      exit: { opacity: 0, y: -25 },
      transition: { duration: 0.6, delay: 0.4 },
    },
    title: {
      initial: { opacity: 0, y: -25 },
      animate: { opacity: 1, y: 1 },
      exit: { opacity: 0, y: -25 },
      transition: { duration: 0.6, delay: 0.6 },
    },
    subtitle: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.4, delay: 1 },
    },
    loginButton: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.4, delay: 0.8 },
    },
    logoMask: {
      animate: { x: ["100%", "-2%"] },
      transition: { duration: 8, ease: "linear", repeat: Infinity },
    },
  },
  numbers: {
    initial: { filter: "blur(6px)" },
    animate: { filter: "blur(0px)" },
    exit: { filter: "blur(6px)" },
    transition: { duration: 0.4 },
  },
  memberKey: {
    key: {
      initial: { opacity: 0, height: 0 },
      animate: { opacity: 1, height: "auto" },
      exit: { opacity: 0, height: 0, padding: 0 },
      transition: { duration: 0.2 },
    },
    selectMember: {
      initial: { opacity: 0, filter: "blur(5px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(5px)" },
      transition: { duration: 0.5 },
    },
    label: {
      initial: { opacity: 0, rotateX: 90 },
      animate: { opacity: 1, rotateX: 0 },
      exit: { opacity: 0, rotateX: -90 },
      transition: { duration: 0.2 },
    },
  },
  skeleton: {
    initial: { opacity: 0 },
    animate: { opacity: [0, 1] },
    exit: { opacity: 0 },
    transition: { duration: 0.8, repeat: Infinity, repeatType: "reverse" },
  } as MotionProps,
  selectToken: {
    initial: { rotateY: -90, filter: "blur(4px)" },
    animate: { rotateY: 0, filter: "blur(0px)" },
    exit: { rotateY: -90, filter: "blur(4px)" },
    transition: { duration: 0.15 },
  },
};

export default motionProps;
