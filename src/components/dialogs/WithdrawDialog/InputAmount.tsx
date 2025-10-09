import { type ChangeEvent } from "react";

import Input from "~/components/ui/input";
import Button from "~/components/ui/button";

export default function InputAmount({
  value,
  error,
  onChange,
  onSetMax,
  disabled,
  clearError,
}: {
  value: string;
  error?: string;
  disabled: boolean;
  onSetMax: () => void;
  clearError: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <Input
        placeholder="0.00"
        value={value}
        error={error}
        onChange={onChange}
        onFocus={clearError}
        className="border-0 bg-transparent font-bold text-5xl h-[44px] indent-0 rounded-none"
      />
      <Button
        variant="secondary"
        onClick={onSetMax}
        disabled={disabled}
        className="px-6 h-11 min-w-0 bg-white/20"
      >
        MAX
      </Button>
    </div>
  );
}
