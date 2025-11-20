import {
  type MotionNodeViewportOptions,
  type MotionNodeAnimationOptions,
} from "motion/react";

type MotionProps = {
  initial?: MotionNodeAnimationOptions["initial"];
  exit?: MotionNodeAnimationOptions["exit"];
  animate?: MotionNodeAnimationOptions["animate"];
  whileInView?: MotionNodeViewportOptions["whileInView"];
  transition?: MotionNodeAnimationOptions["transition"];
};

const duration = 0.3;
const transition = { duration };

export default {
  global: {
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
    tooltip: {
      transition,
      initial: { opacity: 0 },
      exit: { opacity: 0 },
      animate: { opacity: 1 },
    },
    dropdown: {
      transition: { duration, type: "spring" },
      initial: { y: -5, opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
      },
      exit: {
        y: -5,
        opacity: 0,
      },
    },
    numbers: {
      initial: { filter: "blur(6px)" },
      animate: { filter: "blur(0px)" },
      exit: { filter: "blur(6px)" },
      transition: { duration: 0.6 },
    },
    skeleton: {
      initial: { opacity: 0 },
      animate: { opacity: [0.5, 1] },
      exit: { opacity: 0 },
      transition: { duration: 1, repeat: Infinity, repeatType: "reverse" },
    },
    selectTokenDropdown: {
      initial: { rotateY: -90, filter: "blur(4px)" },
      animate: { rotateY: 0, filter: "blur(0px)" },
      exit: { rotateY: -90, filter: "blur(4px)" },
      transition: { duration: 0.15 },
    },
    totalAmountSkeleton: {
      initial: { opacity: 0, filter: "blur(7px)" },
      animate: { opacity: [0.5, 0.7], filter: "blur(7px)" },
      exit: { opacity: 0, filter: "blur(7px)" },
      transition: { duration: 1, repeat: Infinity, repeatType: "reverse" },
    },
    tabs: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 },
    },
  },

  dialog: {
    overlay: {
      transition,
      initial: {
        backdropFilter: "blur(0px)",
      },
      animate: {
        backdropFilter: "blur(8px)",
      },
      exit: {
        backdropFilter: "blur(0px)",
      },
    },
    content: {
      transition: { duration, type: "spring" },
      initial: { scale: 0.95, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
      },
      exit: {
        scale: 0.95,
        opacity: 0,
      },
    },
    close: {
      transition: { duration, type: "spring" },
      initial: { scale: 0.95, opacity: 0 },
      animate: {
        scale: 1,
        opacity: 1,
      },
      exit: {
        scale: 0.95,
        opacity: 0,
      },
    },
  },
  connect: {
    logo: {
      transition: { duration: 0.5, delay: 0.2 },
      initial: { opacity: 0, y: -25, scale: 1.5 },
      animate: { opacity: 1, y: 1, rotateZ: -45, rotateX: 50, scale: 1.3 },
      exit: { opacity: 0, y: -25, scale: 1.5 },
    },
    title: {
      initial: { opacity: 0, y: -25 },
      animate: { opacity: 1, y: 1 },
      exit: { opacity: 0, y: -25 },
      transition: { duration: 0.5, delay: 0.6 },
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
} satisfies { [key: string]: { [key: string]: MotionProps } };
