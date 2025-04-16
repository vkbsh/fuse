import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Root, Item, Content, Trigger } from "@radix-ui/react-dropdown-menu";

type Props = {
  items: React.ReactNode[];
  trigger: React.ReactNode;
  align?: "start" | "end" | "center";
};

export default function Dropdown({ items, trigger, align }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Root onOpenChange={(open) => setIsOpen(open)}>
      <Trigger className="cursor-pointer outline-none">{trigger}</Trigger>
      <AnimatePresence>
        {isOpen && (
          <Content
            asChild
            forceMount
            align={align}
            className="flex flex-col gap-2 justify-center p-2 bg-black border border-border rounded-[20px] shadow-lg drop-shadow-lg text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 16 }}
              exit={{ opacity: 0, y: 0 }}
              className="relative z-50"
            >
              {items.map((item, i) => (
                <Item
                  key={i}
                  onClick={() => setIsOpen(false)}
                  className="outline-none"
                >
                  {item}
                </Item>
              ))}
            </motion.div>
          </Content>
        )}
      </AnimatePresence>
    </Root>
  );
}
