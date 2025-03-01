
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="mr-6 transition-all duration-300 hover:bg-primary/20"
    >
      {theme === "dark" ? 
        <Sun className="h-5 w-5 text-primary animate-pulse" /> : 
        <Moon className="h-5 w-5 text-primary animate-pulse" />
      }
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
