import {
  Root,
  Item,
  Portal,
  Trigger,
  Content,
} from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

export function DropdownMenu({ ...props }: React.ComponentProps<typeof Root>) {
  return <Root data-slot="dropdown-menu" {...props} />;
}

export function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Trigger>) {
  return (
    <Trigger
      className={cn("outline-none", className)}
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

export function DropdownMenuContent({
  isOpen,
  children,
  className,
  sideOffset = 12,
  align = "start",
  ...props
}: React.ComponentProps<typeof Content> & {
  isOpen: boolean;
  align?: "start" | "end";
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <Portal forceMount data-slot="dropdown-menu-portal">
          <motion.div className="fixed inset-0 z-50">
            <Content
              asChild
              align={align}
              sideOffset={sideOffset}
              data-slot="dropdown-menu-content"
              {...props}
            >
              <motion.div
                className={cn(
                  "bg-popover/85 backdrop-blur-sm z-50 rounded-3xl text-popover-foreground drop-shadow-2xl border-2 border-border",
                  className,
                )}
                {...motionProps.global.dropdown}
              >
                {children}
              </motion.div>
            </Content>
          </motion.div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("hover:outline-0", className)}
      {...props}
    />
  );
}
