import { AnimatePresence, motion } from "motion/react";
import { Root, Item, Content, Trigger } from "@radix-ui/react-dropdown-menu";

import { cn } from "~/utils/tw";

type Props = {
  items: React.ReactNode[];
  trigger: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
};

export default function Dropdown({ items, trigger, align, className }: Props) {
  return (
    <Root>
      <Trigger className="cursor-pointer outline-none flex" asChild>
        <div>{trigger}</div>
      </Trigger>
      <AnimatePresence>
        <Content
          asChild
          align={align}
          className={cn(
            "flex flex-col gap-2 p-2 bg-black/85 ring-1 ring-[#A7A7A7] rounded-[20px] shadow-lg drop-shadow-lg text-white",
            className,
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: 0 }}
          >
            {items.map((item, i) => (
              <Item key={i} className="outline-none">
                {item}
              </Item>
            ))}
          </motion.div>
        </Content>
      </AnimatePresence>
    </Root>
  );
}
