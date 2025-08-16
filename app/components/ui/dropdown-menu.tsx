import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import motionProps from "~/lib/motion";

import { cn } from "~/lib/utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      className={cn("outline-none", className)}
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  isOpen,
  children,
  className,
  sideOffset = 12,
  align = "start",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  isOpen: boolean;
  align?: "start" | "end";
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <DropdownMenuPortal forceMount>
          <DropdownMenuPrimitive.Content
            asChild
            align={align}
            sideOffset={sideOffset}
            data-slot="dropdown-menu-content"
            className={cn(
              "bg-popover z-50 rounded-3xl text-popover-foreground select-none",
              className,
            )}
            {...props}
          >
            <motion.div {...motionProps.slideDownDropdown}>
              {children}
            </motion.div>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPortal>
      )}
    </AnimatePresence>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
};
