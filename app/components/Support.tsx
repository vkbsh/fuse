import { Headset } from "lucide-react";

import { Button } from "~/components/ui/button";

export default function Support() {
  return (
    <Button size="icon" variant="outline">
      <Headset size={18} /> {/* TODO: add support */}
    </Button>
  );
}
