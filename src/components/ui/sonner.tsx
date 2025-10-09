import { Toaster as Sonner, type ToasterProps } from "sonner";

export default function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          borderRadius: "var(--radius-3xl)",
          borderColor: "var(--border)",
          padding: "16px",
        },
      }}
      {...props}
    />
  );
}
