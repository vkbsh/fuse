import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { motion, AnimatePresence } from "motion/react";

import { IconClose } from "~/components/ui/icons/IconClose";
import { useToastStore } from "~/state/toast";
import { cn } from "~/utils/tw";

const ANIMATION_OUT_DURATION = 350;

export const Toasts = () => {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const { toasts, removeToast } = useToastStore();
  const toastsArray = Array.from(toasts);
  const [isHovering, setIsHovering] = React.useState(false);

  return (
    <ToastPrimitive.Provider>
      <div
        className="fixed bottom-0 right-0 w-[390px] max-w-full z-50 p-4"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence>
          {toastsArray.map(([key, toast], index) => (
            <Toast
              key={key}
              id={key}
              toast={toast}
              index={index}
              isHovering={isHovering}
              total={toastsArray.length}
              onOpenChange={(open) => {
                if (!open) {
                  useToastStore.getState().setToastElement(key, null);
                  setTimeout(() => {
                    removeToast(key);
                  }, ANIMATION_OUT_DURATION);
                }
              }}
            />
          ))}
        </AnimatePresence>
      </div>
      <ToastPrimitive.Viewport
        ref={viewportRef}
        className="fixed bottom-0 right-0 w-[390px] max-w-full z-50 p-4 flex flex-col gap-2 pointer-events-none"
      />
    </ToastPrimitive.Provider>
  );
};

const ToastStatusIcon = ({
  status,
}: {
  status: "default" | "success" | "error";
}) => {
  if (status === "success") {
    return <div className="checkmark" />;
  }
  if (status === "error") {
    return <div className="crossmark" />;
  }
  return null;
};

type Toast = {
  status: "default" | "success" | "error";
  open: boolean;
  type?: string;
  duration?: number;
  description: string;
};

const Toast = (props: {
  id: string;
  toast: Toast;
  index: number;
  isHovering: boolean;
  total: number;
  onOpenChange: (open: boolean) => void;
}) => {
  const { onOpenChange, toast, id, index, isHovering, total, ...toastProps } =
    props;
  const ref = React.useRef<HTMLDivElement>(null);
  const isFront = index === 0;

  React.useLayoutEffect(() => {
    if (ref.current) {
      useToastStore.getState().setToastElement(id, ref.current);
    }
  }, [id]);

  // Calculate position based on index and hover state
  const yOffset = isHovering ? index * -60 : index * -10;
  const scale = isHovering ? 1 : isFront ? 1 : 0.95;
  const opacity = isHovering ? 1 : isFront ? 1 : 0.7;
  const zIndex = total - index;

  return (
    <ToastPrimitive.Root
      {...toastProps}
      ref={ref}
      type={toast.type}
      duration={toast.duration || 5000}
      onOpenChange={onOpenChange}
      asChild
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{
          opacity: opacity,
          y: yOffset,
          scale: scale,
          transition: { duration: 0.3 },
        }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-4 right-4 w-[calc(100%-2rem)] pointer-events-auto"
        style={{ zIndex }}
      >
        <div
          className={cn(
            "p-4 rounded-lg shadow-lg bg-white",
            "grid gap-2",
            toast.status !== "default" &&
              "grid-cols-[max-content_1fr_max-content]",
            toast.status === "default" && "grid-cols-[1fr_max-content]",
            !isFront && !isHovering && "pointer-events-none",
          )}
          data-status={toast.status}
        >
          <ToastStatusIcon status={toast.status} />
          <div className="flex flex-col">
            <ToastPrimitive.Title className="font-medium text-slate-900 text-sm">
              {toast.status === "success"
                ? "Success"
                : toast.status === "error"
                  ? "Error"
                  : "Notification"}
            </ToastPrimitive.Title>
            <ToastPrimitive.Description className="text-slate-700 text-xs">
              {toast.description}
            </ToastPrimitive.Description>
          </div>
          <ToastPrimitive.Close
            aria-label="Close"
            className="self-start text-slate-500 hover:text-slate-900 transition-colors"
          >
            <IconClose />
          </ToastPrimitive.Close>
        </div>
      </motion.div>
    </ToastPrimitive.Root>
  );
};
