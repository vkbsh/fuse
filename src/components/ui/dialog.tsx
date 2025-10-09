import {
  Root,
  Close,
  Title,
  Portal,
  Content,
  Description,
} from "@radix-ui/react-dialog";
import { XIcon } from "~/components/ui/icons/X";
import { AnimatePresence, motion } from "motion/react";

import Button from "~/components/ui/button";

import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

export function Dialog({ ...props }: React.ComponentProps<typeof Root>) {
  return <Root data-slot="dialog" {...props} />;
}

export function DialogContent({
  title,
  isOpen,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Content> & {
  isOpen: boolean;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Portal forceMount data-slot="dialog-portal">
          <motion.div
            className="fixed inset-0 z-50"
            {...motionProps.dialog.overlay}
          />

          <Content
            asChild
            data-slot="dialog-content"
            className={cn(
              "flex flex-col gap-10 fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] p-8 bg-popover/85 text-primary-foreground border border-border rounded-4xl backdrop-blur-sm drop-shadow-2xl",
              className,
            )}
            {...props}
          >
            <motion.div
              {...motionProps.dialog.content}
              className="flex flex-col gap-6"
            >
              <Description hidden data-slot="dialog-description" />
              {title ? (
                <Title
                  data-slot="dialog-title"
                  className="text-center text-xl leading-none font-semibold cursor-default"
                >
                  {title}
                </Title>
              ) : (
                <Title hidden data-slot="dialog-title" />
              )}
              {children}
              <Close asChild data-slot="dialog-close">
                <motion.div
                  {...motionProps.dialog.close}
                  className="absolute -bottom-20 left-0 right-0 m-auto flex items-center w-[47px] h-[47px]"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full w-[47px] h-[47px] bg-black/60 border-border"
                  >
                    <XIcon />
                  </Button>
                </motion.div>
              </Close>
            </motion.div>
          </Content>
        </Portal>
      )}
    </AnimatePresence>
  );
}
