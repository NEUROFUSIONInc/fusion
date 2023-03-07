import { useTheme } from "next-themes";
import { memo, useEffect } from "react";

const ThemeChanger = memo(({ theme }: { theme: "light" | "dark" | "system" }) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  return null;
});

ThemeChanger.displayName = "ThemeChange";

export { ThemeChanger };
