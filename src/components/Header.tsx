import { LogoIcon } from "~/components/ui/icons/Logo";
import VaultDropdown from "~/components/VaultDropdown";
import MemberKeysDropdown from "~/components/MemberKeysDropdown";

export default function Header() {
  return (
    <header className="h-[42px] flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="flex items-center justify-center text-foreground rounded-full size-[42px] bg-accent-background">
          <LogoIcon />
        </span>
        <VaultDropdown />
      </div>
      <div id="header-right" className="flex items-center gap-4">
        <MemberKeysDropdown />
      </div>
    </header>
  );
}
