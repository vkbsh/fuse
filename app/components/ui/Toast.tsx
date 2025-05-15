import {
  Root,
  Title,
  Close,
  Viewport,
  Provider,
  Description,
} from "@radix-ui/react-toast";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { IconClose } from "~/components/ui/icons/IconClose";

const Toast = () => {
  // TODO: Use zustand store
  const [isOpen, onOpenChange] = useState(false);

  const title = "Connected";
  const description = "You have successfully connected to your Fuse account";

  return (
    <Provider>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: 999 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 999 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-4 right-4"
          >
            <Root
              forceMount
              onOpenChange={onOpenChange}
              className="w-[300px] h-[110px] flex flex-col bg-black/90 text-white rounded-2xl p-4"
            >
              <Close asChild>
                <motion.button
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="absolute top-5 right-4 flex items-center ml-auto opacity-60 cursor-pointer"
                >
                  <IconClose size={12} />
                </motion.button>
              </Close>
              <Title>{title}</Title>
              <Description>{description}</Description>
            </Root>
            <Viewport />
          </motion.div>
        )}
      </AnimatePresence>
    </Provider>
  );
};

export default Toast;
