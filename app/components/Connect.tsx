import { motion } from "motion/react";
import { CloudIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import ConnectWalletDialog from "~/components/ConnectWalletDialog";

import { useQueryReset } from "~/hooks/resources";

export default function Connect() {
  useQueryReset();

  return (
    <>
      <motion.div
        key="logo"
        transition={{ duration: 0.8, delay: 0.4 }}
        initial={{ opacity: 0, y: -25, scale: 2 }}
        animate={{ opacity: 1, y: 1, rotateZ: -45, rotateX: 50, scale: 1.3 }}
        exit={{ opacity: 0, y: -25 }}
        className="logo-mask flex flex-col gap-1.5 w-[520px] h-[520px] overflow-hidden"
      >
        <LogoMask />
      </motion.div>
      <div className="flex flex-col gap-6 items-center select-none">
        <div className="flex flex-col gap-1 items-center">
          <motion.h2
            key="subtitle"
            transition={{ duration: 0.6, delay: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-placeholder"
          >
            Fuse
          </motion.h2>
          <motion.h1
            key="title"
            transition={{ duration: 0.6, delay: 0.6 }}
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 1 }}
            exit={{ opacity: 0, y: -25 }}
            className="font-medium text-4xl sm:text-[45px] text-center whitespace-nowrap"
          >
            Security is in our DNA
          </motion.h1>
        </div>
        <motion.div
          key="button"
          transition={{ duration: 0.6, delay: 0.8 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ConnectWalletDialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CloudIcon size={16} />
                <span>Log in with Fuse 2FA</span>
              </Button>
            </DialogTrigger>
          </ConnectWalletDialog>
        </motion.div>
      </div>
    </>
  );
}

function LogoMask() {
  return Array.from({ length: 25 }).map((_, i) => (
    <div key={i} className="flex flex-row gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i + i}
          className="uppercase whitespace-nowrap text-xs sm:text-sm font-light"
        >
          Security is in our DNA
        </span>
      ))}
    </div>
  ));
}
