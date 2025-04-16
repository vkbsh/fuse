import { cn } from "~/utils/tw";

const Input = ({ ...props }) => {
  return (
    <input {...props} className={cn("outline-0 w-full", props.className)} />
  );
};

export default Input;
