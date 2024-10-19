import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div>
      <div className="bg-[#f5f5f5] text-gray-800 dark:text-gray-200 dark:bg-[rgba(16,23,42,0.96)] min-h-screen">
        {children}
      </div>
    </div>
  );
}
