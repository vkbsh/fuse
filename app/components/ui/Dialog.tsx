import { ReactNode } from "react";
import {
  Root,
  Close,
  Title,
  Portal,
  Trigger,
  Content,
} from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";

import { IconClose } from "~/components/ui/icons/IconClose";

export default function Dialog({
  isOpen,
  trigger,
  children,
  onOpenChange,
}: {
  isOpen: boolean;
  trigger: ReactNode;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Root open={isOpen} onOpenChange={onOpenChange}>
      {trigger && (
        <Trigger asChild className="cursor-pointer max-w-max">
          {trigger}
        </Trigger>
      )}
      <Portal key="dialog-portal" forceMount>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="dialog"
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{
                backdropFilter: "blur(10px)",
                transition: { duration: 1 },
              }}
              exit={{
                backdropFilter: "blur(0px)",
                transition: { duration: 0.3 },
              }}
              className="h-full w-full fixed top-0 left-0 z-10"
            >
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
                  y: -32,
                  opacity: 0,
                }}
                className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20 overflow-visible drop-shadow-2xl"
              >
                <Content aria-describedby={undefined}>
                  <Title className="hidden" />
                  {children}
                  <Close>
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
                      className="cursor-pointer absolute -bottom-18 left-0 right-0 z-0 w-[47px] h-[47px] rounded-full bg-black/60 text-white flex items-center justify-center mx-auto drop-shadow-2xl border border-[#A7A7A7]"
                    >
                      <IconClose />
                    </motion.button>
                  </Close>
                </Content>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </Root>
  );
}
