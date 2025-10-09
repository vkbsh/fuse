import { type ChangeEvent } from "react";

import Input from "~/components/ui/input";

export default function InputAddress({
  value,
  error,
  onChange,
  clearError,
}: {
  value: string;
  error?: string;
  clearError: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Input
      maxLength={44}
      value={value}
      error={error}
      onChange={onChange}
      onFocus={clearError}
      placeholder="Enter wallet address"
    />
  );
}
