import { cn } from "~/utils/tw";

const Input = ({ ...props }) => {
  return (
    <input
      {...props}
      autoComplete="off"
      className={cn("outline-0 w-full", props.className)}
    />
  );
};

export default Input;
