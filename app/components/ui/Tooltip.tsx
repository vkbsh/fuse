import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useState } from "react";
import {
  Root,
  Portal,
  Content,
  Trigger,
  Provider,
} from "@radix-ui/react-tooltip";

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
        <Portal forceMount>
          <AnimatePresence>
            {open && (
              <Content>
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: -10 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="relative text-white bg-black px-2 py-1 rounded-2xl border border-select-border"
                >
                  {text}
                </motion.div>
              </Content>
            )}
          </AnimatePresence>
        </Portal>
      </Root>
    </Provider>
  );
}
