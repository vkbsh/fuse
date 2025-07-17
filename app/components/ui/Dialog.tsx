import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button } from "~/components/ui/button";
import { ShineBorder } from "~/components/ui/animated/shine-border";

import { cn } from "~/lib/utils";
import { useAnimationProps } from "~/hooks/animation";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger outline-none"
      className="outline-none"
      {...props}
    />
  );
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

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className="fixed inset-0 z-50"
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  isOpen,
  title,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  isOpen: boolean;
  title: string;
}) {
  const blurProps = useAnimationProps("blur");
  const slideDownModalProps = useAnimationProps("slideDownModal");

  return (
    <AnimatePresence>
      {isOpen && (
        <DialogPortal forceMount>
          <DialogPrimitive.Overlay
            asChild
            data-slot="dialog-overlay"
            className="fixed inset-0 z-50"
          >
            <motion.div {...blurProps} />
          </DialogPrimitive.Overlay>

          <DialogPrimitive.Content
            asChild
            data-slot="dialog-content"
            className={cn(
              "flex flex-col gap-6 fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] p-6 bg-background rounded-3xl",
              className,
            )}
            {...props}
          >
            <motion.div
              {...slideDownModalProps}
              transition={{ duration: 0.4 }}
              className="select-none"
            >
              <DialogDescription />
              <ShineBorder />
              <DialogTitle>{title}</DialogTitle>
              {children}
              <motion.div
                {...slideDownModalProps}
                transition={{ duration: 0.4 }}
                className="absolute -bottom-16 left-0 right-0 w-[36px] h-[36px] m-auto flex items-center"
              >
                <DialogClose asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                  >
                    <X />
                  </Button>
                </DialogClose>
              </motion.div>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-center text-lg leading-none font-semibold cursor-default",
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
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
