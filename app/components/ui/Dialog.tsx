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
      <AnimatePresence>
        {isOpen && (
          <Animate
            key="dialog"
            variant="blur"
            className="h-full w-full fixed top-0 left-0 z-10"
          >
            <Portal forceMount>
              <Content
                aria-describedby={undefined}
                className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-20 overflow-visible drop-shadow-2xl"
              >
                <Animate key="dialog-content" variant="slideDownModal">
                  <Title className="hidden" />
                  {children}
                  <Animate key="dialog-close" variant="slideDownModal">
                    <Close asChild>
                      <Button className="w-[50px] h-[50px] p-0 rounded-full absolute -bottom-18 left-0 right-0 m-auto">
                        <IconClose />
                      </Button>
                    </Close>
                  </Animate>
                </Animate>
              </Content>
            </Portal>
          </Animate>
        )}
      </AnimatePresence>
    </Root>
  );
}
