import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import { IconLogo } from "~/components/ui/icons/IconLogo";
import { AnimatedShinyText } from "~/components/ui/animated/shine-text";
import ConnectWalletDialog from "./ConnectWalletDialog";

export default function Connect() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // TODO: we can keep jupiter token metas
    queryClient.removeQueries();
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 m-auto">
      <motion.div
        key="logo"
        transition={{ duration: 0.6, delay: 0.4 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
      >
        <IconLogo
          size={520}
          className="aspect-square max-w-[220px] sm:max-w-[320px] md:max-w-[420px] w-full h-full"
        />
      </motion.div>
      <div className="flex flex-col gap-1 items-center">
        <motion.h2
          key="subtitle"
          transition={{ duration: 0.6, delay: 0.8 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <AnimatedShinyText>Fuse</AnimatedShinyText>
        </motion.h2>
        <motion.h1
          key="title"
          transition={{ duration: 0.6, delay: 0.6 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="font-semibold text-4xl sm:text-6xl text-center"
        >
          Security is in our DNA
        </motion.h1>
      </div>
      <motion.div
        key="button"
        transition={{ duration: 0.6, delay: 1 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
      >
        <ConnectWalletDialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Log in with Fuse 2FA</Button>
          </DialogTrigger>
        </ConnectWalletDialog>
      </motion.div>
    </div>
  );
}
