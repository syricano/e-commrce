import { useLang } from "@/context/LangProvider";

export default function LangSwitcher() {
  const { lang, setLang, t } = useLang();
  const next = lang === "ar" ? "en" : "ar";
  const label = next === "ar" ? "ع" : "EN";

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      className="btn btn-ghost btn-circle btn-sm"
      aria-label={t('Toggle language') || 'Toggle language'}
      title={lang === "ar" ? (t('English') || 'English') : (t('Arabic') || 'Arabic')}
    >
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
