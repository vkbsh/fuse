import { X } from "lucide-react";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "~/components/ui/button";

import {
  Dialog,
  DialogTitle,
  DialogClose,
  DialogPortal,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
} from "~/components/ui/dialog";

import { useAnimationProps } from "~/hooks/animation";
import { useDialog, DialogName } from "~/state/dialog";

type Props = {
  title: string;
  name: DialogName;
  children: ReactNode;
  trigger?: ReactNode;
};

export default function AppDialog({ children, title, trigger, name }: Props) {
  const { isOpen, onOpenChange } = useDialog(name);
  const blurProps = useAnimationProps("blur");
  const slideDownModalProps = useAnimationProps("slideDownModal");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <AnimatePresence>
        {isOpen && (
          <DialogPortal forceMount>
            <DialogOverlay asChild forceMount>
              <motion.div {...blurProps} />
            </DialogOverlay>
            <DialogContent asChild>
              <motion.div {...slideDownModalProps}>
                <DialogTitle className="text-center">{title}</DialogTitle>
                {children}
                <DialogClose asChild>
                  <motion.div
                    {...slideDownModalProps}
                    className="absolute -bottom-16 right-0 left-0 m-auto flex justify-center items-center"
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      className="rounded-full"
                    >
                      <X />
                    </Button>
                  </motion.div>
                </DialogClose>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
