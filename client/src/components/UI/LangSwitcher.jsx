import { useEffect, useState } from "react";
const apply = (lng) => {
  const isAr = lng === "ar";
  document.documentElement.setAttribute("lang", lng);
  document.documentElement.setAttribute("dir", isAr ? "rtl" : "ltr");
  localStorage.setItem("lang", lng);
  window.dispatchEvent(new Event("langchange"));
};
export default function LangSwitcher() {
  const [lang, setLang] = useState("ar");
  useEffect(() => {
    const saved = localStorage.getItem("lang") || "ar";
    setLang(saved); apply(saved);
  }, []);
  const toggle = () => { const next = lang === "ar" ? "en" : "ar"; setLang(next); apply(next); };
  return (
    <button type="button" onClick={toggle} className="btn btn-ghost btn-square" aria-label="language"
      title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
      <span className="text-sm font-semibold">{lang === "ar" ? "EN" : "AR"}</span>
    </button>
  );
}
