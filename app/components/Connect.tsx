import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "~/components/ui/button";
import { IconLogo } from "~/components/ui/icons/IconLogo";

import { useDialog } from "~/state/dialog";
import { useAnimationProps } from "~/hooks/animation";

export default function Connect() {
  const queryClient = useQueryClient();
  const fadeInProps = useAnimationProps("fadeIn");
  const { onOpenChange } = useDialog("connectWallet");

  useEffect(() => {
    queryClient.removeQueries();
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 m-auto text-primary-text">
      <AnimatePresence>
        <motion.div {...fadeInProps} transition={{ delay: 0.4 }}>
          <IconLogo size={520} className="w-full max-w-[520px]" />
        </motion.div>
        <motion.h2
          {...fadeInProps}
          transition={{ delay: 0.8 }}
          className="text-grey opacity-40"
        >
          Fuse
        </motion.h2>
        <motion.h1
          {...fadeInProps}
          transition={{ delay: 0.6 }}
          className="font-semibold text-5xl text-center"
        >
          Security is in our DNA
        </motion.h1>
        <motion.div {...fadeInProps} transition={{ delay: 0.4 }}>
          <Button onClick={() => onOpenChange(true)}>
            Log in with Fuse 2FA
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
