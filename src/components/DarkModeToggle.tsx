import { useTheme } from "../context/useTheme";
import "../index.css";

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button className="darkmode-btn" onClick={toggleDarkMode}>
      {darkMode ? "🔆" : "🌙"}
    </button>
  );
};

export default DarkModeToggle;
