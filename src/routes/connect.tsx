import { motion, AnimatePresence } from "motion/react";

import Button from "~/components/ui/button";

import motionProps from "~/lib/motion";
import { useDialogStore } from "~/state/dialog";
import { useQueryReset } from "~/hooks/resources";

export default function Connect() {
  useQueryReset();
  const { onOpenChange: onOpenChangeRpc } = useDialogStore("rpc");
  const { onOpenChange: onOpenChangeConnect } = useDialogStore("connect");

  return (
    <>
      <motion.div
        key="logo"
        className="logo-mask flex flex-col gap-0.5 sm:gap-1.5 w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] md:w-[520px] md:h-[520px] 2xl:w-[720px] 2xl:h-[720px] overflow-hidden"
        {...motionProps.connect.logo}
      >
        <LogoMask />
      </motion.div>
      <div className="flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-1 items-center">
          <motion.h1
            key="title"
            className="text-placeholder"
            {...motionProps.connect.subtitle}
          >
            Fuse
          </motion.h1>
          <motion.h2
            key="subtitle"
            className="font-medium text-4xl sm:text-[45px] text-center whitespace-nowrap"
            {...motionProps.connect.title}
          >
            Security is in our DNA
          </motion.h2>
        </div>
        <motion.div
          key="login-button"
          className="flex flex-col gap-4"
          {...motionProps.connect.loginButton}
        >
          <Button variant="outline" onClick={() => onOpenChangeConnect(true)}>
            <span>Log in with Fuse 2FA</span>
          </Button>
          <Button variant="outline" onClick={() => onOpenChangeRpc(true)}>
            <span>Set Rpc URL</span>
          </Button>
        </motion.div>
      </div>
    </>
  );
}

function LogoMask() {
  return Array.from({ length: 35 }).map((_, i) => (
    <div key={i} className="flex flex-row gap-1 justify-center">
      <AnimatePresence>
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i + i}
            className="uppercase whitespace-nowrap text-xs sm:text-sm font-light"
            {...motionProps.connect.logoMask}
          >
            Security is in our DNA
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  ));
}
