import Animate from "./Animate";
import { fadeIn } from "./variants";

export default function FadeIn({
  children,
  className,
  ...rest
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Animate
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={className}
      {...rest}
    >
      {children}
    </Animate>
  );
}
