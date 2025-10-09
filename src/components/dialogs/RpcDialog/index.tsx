import { useState } from "react";
import Input from "~/components/ui/input";
import Button from "~/components/ui/button";

import { useRpcStore } from "~/state/rpc";

export default function RpcDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const { RPC_URL, setRpc } = useRpcStore();
  const [rpcUrl, setRpcUrl] = useState(RPC_URL);
  const [error, setError] = useState("");

  return (
    <div className="flex flex-row items-center gap-4">
      <Input
        error={error}
        value={rpcUrl}
        onFocus={() => setError("")}
        onChange={(e) => setRpcUrl(e.target.value)}
      />
      <Button
        onClick={() => {
          try {
            const url = new URL(rpcUrl);
            setRpc(url.toString());
            onOpenChange(false);
          } catch (e) {
            console.error(e);
            setError("Invalid URL");
          }
        }}
      >
        Set
      </Button>
    </div>
  );
}
