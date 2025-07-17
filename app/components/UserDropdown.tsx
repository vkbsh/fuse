import { Ellipsis } from "lucide-react";

import Support from "~/components/Support";
import ThemeToggle from "~/components/ThemeToggle";

// TODO: add user dropdown

export default function UserDropdown() {
  return (
    <div className="flex flex-row gap-2">
      {/* <ThemeToggle />
      <Support /> */}
      <Ellipsis />
    </div>
  );
}
