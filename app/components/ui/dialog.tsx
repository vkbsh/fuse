import { XIcon } from "~/components/ui/icons/X";
import { AnimatePresence, motion } from "motion/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "~/components/ui/button";

import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-center text-xl leading-none font-semibold cursor-default",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description data-slot="dialog-description" {...props} />
  );
}

function DialogContent({
  title,
  isOpen,
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  isOpen: boolean;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPortal forceMount>
          <motion.div
            className="fixed inset-0 z-50"
            {...motionProps.dialog.overlay}
          />

          <DialogPrimitive.Content
            asChild
            data-slot="dialog-content"
            className={cn(
              "flex flex-col gap-10 fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] p-8 bg-popover text-primary-foreground border rounded-4xl",
              className,
            )}
            {...props}
          >
            <motion.div
              {...motionProps.dialog.content}
              className="select-none flex flex-col gap-6"
            >
              <DialogDescription hidden />
              {title ? (
                <DialogTitle>{title}</DialogTitle>
              ) : (
                <DialogTitle hidden />
              )}
              {children}
              <DialogClose asChild>
                <motion.div
                  {...motionProps.dialog.close}
                  className="absolute -bottom-20 left-0 right-0 m-auto flex items-center w-[47px] h-[47px]"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full w-[47px] h-[47px]"
                  >
                    <XIcon />
                  </Button>
                </motion.div>
              </DialogClose>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}

export { Dialog, DialogContent };
