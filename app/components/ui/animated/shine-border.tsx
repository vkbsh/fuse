import { cn } from "~/lib/utils";
import { useThemeStore } from "~/state/theme";

type ShineBorderProps = {
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
  className?: string;
};

export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  className,
  ...props
}: ShineBorderProps) {
  const { theme } = useThemeStore();
  const shineColor =
    theme === "dark" ? "var(--color-foreground)" : "var(--color-foreground)";

  return (
    <div
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          backgroundImage: `radial-gradient(transparent,transparent, ${
            Array.isArray(shineColor) ? shineColor.join(",") : shineColor
          },transparent,transparent)`,
          backgroundSize: "300% 300%",
          mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "var(--border-width)",
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-shine",
        className,
      )}
      {...props}
    />
  );
}
