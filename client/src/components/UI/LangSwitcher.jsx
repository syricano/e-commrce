import { useLang } from "@/context/LangProvider";

export default function LangSwitcher() {
  const { lang, setLang } = useLang();
  const next = lang === "ar" ? "en" : "ar";
  const label = next === "ar" ? "ع" : "EN";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label="toggle language"
      title={lang === "ar" ? "English" : "العربية"}
    >
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
