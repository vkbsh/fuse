import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { useThemeStore } from "~/state/theme";
import { Button } from "~/components/ui/button";

export default function ThemeToggle() {
  const { setTheme, theme } = useThemeStore();

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: -90 }}
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
