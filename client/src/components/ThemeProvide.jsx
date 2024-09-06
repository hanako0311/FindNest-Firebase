import { useSelector } from "react-redux";

export default function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.theme);
  return (
    <div className={theme}>
      <div className="bg-[#f5f5f5] text-gray-800 dark:text-gray-200 dark:bg-[rgba(16,23,42,0.96)] min-h-screen">
        {children}
      </div>
    </div>
  );
}
