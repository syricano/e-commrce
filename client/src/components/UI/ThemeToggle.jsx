import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setIsDark(saved === "dark"); document.documentElement.setAttribute("data-theme", saved);
  }, []);
  const toggle = () => {
    const next = isDark ? "light" : "dark"; setIsDark(!isDark);
    document.documentElement.setAttribute("data-theme", next); localStorage.setItem("theme", next);
  };
  return (
    <label className="btn btn-ghost btn-square swap swap-rotate">
      <input type="checkbox" onChange={toggle} checked={isDark} aria-label="theme" />
      <svg className="swap-off h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.64 17.657 4.22 19.07l1.414 1.414 1.414-1.414-1.414-1.414ZM1 13h2v-2H1v2Zm10 10h2v-2h-2v2ZM11 3h2V1h-2v2ZM3.05 7.05 4.464 5.636 3.05 4.222 1.636 5.636 3.05 7.05ZM18.364 5.636 19.778 4.222 18.364 2.808 16.95 4.222 18.364 5.636ZM21 13h2v-2h-2v2ZM18.364 18.364l1.414 1.414 1.414-1.414-1.414-1.414-1.414 1.414ZM12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
      </svg>
      <svg className="swap-on h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.64 13.64A9 9 0 1 1 10.36 2.36 7 7 0 1 0 21.64 13.64Z"/>
      </svg>
    </label>
  );
}
