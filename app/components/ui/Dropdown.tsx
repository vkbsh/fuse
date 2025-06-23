import { AnimatePresence, motion } from "motion/react";
import { Root, Item, Content, Trigger } from "@radix-ui/react-dropdown-menu";

import { cn } from "~/utils/tw";
import { useState } from "react";

type Props = {
  className?: string;
  items: React.ReactNode[];
  trigger: React.ReactNode;
  align?: "start" | "end" | "center";
};

export default function Dropdown({ items, trigger, align, className }: Props) {
  const [isOpen, onOpenChange] = useState(false);

  return (
    <Root open={isOpen} onOpenChange={onOpenChange}>
      <Trigger className="cursor-pointer outline-none flex" asChild>
        <button>{trigger}</button>
      </Trigger>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: 0 }}
            className="absolute z-20"
          >
            <Content
              align={align}
              forceMount
              className={cn(
                "flex flex-col gap-2 p-4 bg-black-85 ring-1 ring-[#A7A7A7] rounded-[20px] shadow-lg drop-shadow-lg text-white",
                className,
              )}
            >
              {items.map((item, i) => (
                <Item key={i} className="outline-none">
                  {item}
                </Item>
              ))}
            </Content>
          </motion.div>
        )}
      </AnimatePresence>
    </Root>
  );
}
