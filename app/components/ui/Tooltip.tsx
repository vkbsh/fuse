import {
  Root,
  Portal,
  Content,
  Trigger,
  Provider,
} from "@radix-ui/react-tooltip";
import { ReactNode, useState } from "react";
import { AnimatePresence } from "motion/react";

import Animate from "~/components/animated/Animate";

export default function Tooltip({
  text,
  children,
}: {
  text: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Provider delayDuration={500}>
      <Root open={open} onOpenChange={setOpen}>
        <Trigger asChild>{children}</Trigger>
        <AnimatePresence>
          <Portal forceMount>
            <Content className="z-20">
              {open && (
                <Animate
                  key="tooltip"
                  variant="slideDown"
                  className="relative text-white bg-black px-2 py-1 rounded-2xl border border-select-border"
                >
                  {text}
                </Animate>
              )}
            </Content>
          </Portal>
        </AnimatePresence>
      </Root>
    </Provider>
  );
}
