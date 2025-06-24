import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { Root, Item, Content, Trigger } from "@radix-ui/react-dropdown-menu";

import Animate from "~/components/animated/Animate";

import { cn } from "~/utils/tw";

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
          <Content forceMount align={align}>
            <Animate
              variant="slideDown"
              className={cn(
                "relative z-20 flex flex-col gap-2 p-4 bg-black ring-1 ring-ring-dropdown rounded-[20px] shadow-lg drop-shadow-lg text-white",
                className,
              )}
            >
              {items.map((item, i) => (
                <Item key={i} className="outline-none">
                  {item}
                </Item>
              ))}
            </Animate>
          </Content>
        )}
      </AnimatePresence>
    </Root>
  );
}
