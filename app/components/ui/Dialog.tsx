import {
  Root,
  Close,
  Title,
  Portal,
  Trigger,
  Content,
} from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { AnimatePresence } from "motion/react";

import Animate from "~/components/animated/Animate";
import { IconClose } from "~/components/ui/icons/IconClose";
import Button from "./Button";

export default function Dialog({
  isOpen,
  children,
  onOpenChange,
}: {
  isOpen: boolean;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Root open={isOpen} onOpenChange={onOpenChange}>
      <Trigger hidden />
      <Portal key="dialog-portal" forceMount>
        <AnimatePresence>
          {isOpen && (
            <Animate
              variant="blur"
              className="h-full w-full fixed top-0 left-0 z-10"
            >
              <Animate
                variant="slideDown"
                className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20 overflow-visible drop-shadow-2xl"
              >
                <Content aria-describedby={undefined}>
                  <Title className="hidden" />
                  {children}
                  <Close asChild>
                    <Button className="w-[50px] h-[50px] p-0 rounded-full absolute -bottom-18 left-0 right-0 m-auto">
                      <IconClose />
                    </Button>
                  </Close>
                </Content>
              </Animate>
            </Animate>
          )}
        </AnimatePresence>
      </Portal>
    </Root>
  );
}
