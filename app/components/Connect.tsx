import Button from "~/components/ui/Button";

import { useDialog } from "~/state/dialog";

export default function Connect() {
  const { onOpenChange } = useDialog("connectWallet");

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col gap-6 m-auto">
        <div className="max-w-[800px] w-full ">
          <img src="/images/SDNA-fuse.png" alt="Fuse" />
        </div>
        <div className="relative flex flex-col items-center justify-center gap-6">
          <span className="text-grey opacity-40">Fuse</span>
          <h1 className="font-semibold text-5xl text-center">
            Security is in our DNA
          </h1>
          <Button size="full" onClick={() => onOpenChange(true)}>
            Log in with Fuse 2FA
          </Button>
        </div>
      </div>
    </div>
  );
}
