import { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Root,
  Close,
  Title,
  Portal,
  Trigger,
  Overlay,
  Content,
} from "@radix-ui/react-dialog";

import { IconClose } from "~/components/icons/IconClose";

export default function Dialog({
  isOpen,
  trigger,
  children,
  onOpenChange,
}: {
  isOpen?: boolean;
  trigger: ReactNode;
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Root open={isOpen} onOpenChange={onOpenChange}>
      <Trigger asChild>
        <span>{trigger}</span>
      </Trigger>
      <AnimatePresence>
        <Portal key="dialog-portal">
          <motion.div
            key="dialog"
            initial={{ backdropFilter: "blur(0px)" }}
            animate={{
              backdropFilter: "blur(10px)",
              transition: { duration: 6 },
            }}
            exit={{ backdropFilter: "blur(0px)" }}
            className="h-full w-full fixed top-0 left-0 z-10"
          >
            <Overlay />
            <motion.div
              key="overlay"
              initial={{
                y: -32,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20 overflow-visible drop-shadow-2xl"
            >
              <Content aria-describedby={undefined}>
                <Title className="hidden" />
                {children}
                <Close asChild>
                  <motion.button
                    animate={{
                      y: [-16, 0],
                      transition: {
                        duration: 0.4,
                      },
                    }}
                    whileHover={{
                      scale: 1.1,
                    }}
                    className="cursor-pointer absolute -bottom-20 left-0 right-0 z-0 w-[47px] h-[47px] rounded-full bg-black text-white flex items-center justify-center mx-auto drop-shadow-2xl"
                  >
                    <IconClose />
                  </motion.button>
                </Close>
              </Content>
            </motion.div>
          </motion.div>
        </Portal>
      </AnimatePresence>
    </Root>
  );
}
