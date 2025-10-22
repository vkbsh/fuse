import { useState } from "react";
import { type Address } from "gill";
import { motion, AnimatePresence } from "framer-motion";

import Earn from "~/components/Earn";
import Coins from "~/components/Coins";

import { cn } from "~/lib/utils";
import motionProps from "~/lib/motion";

export default function CoinsEarnTabs({
  vaultAddress,
}: {
  vaultAddress: Address;
}) {
  const [activeTab, setActiveTab] = useState<"coins" | "earn">("coins");

  return (
    <div className="flex flex-1 flex-col gap-3">
      <h3 className="flex flex-row gap-4 text-xl font-semibold">
        <button onClick={() => setActiveTab("coins")}>
          <span
            className={cn(
              "transition-colors duration-300",
              activeTab !== "coins" ? "text-border hover:text-placeholder" : "",
            )}
          >
            Coins
          </span>
        </button>
        <button onClick={() => setActiveTab("earn")}>
          <span
            className={cn(
              "transition-colors duration-300",
              activeTab !== "earn" ? "text-border hover:text-placeholder" : "",
            )}
          >
            Earn
          </span>
        </button>
      </h3>
      <AnimatePresence mode="wait">
        {activeTab === "coins" ? (
          <motion.div key="coins" {...motionProps.global.fadeIn}>
            <Coins vaultAddress={vaultAddress} />
          </motion.div>
        ) : (
          <motion.div key="earn" {...motionProps.global.fadeIn}>
            <Earn vaultAddress={vaultAddress} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
