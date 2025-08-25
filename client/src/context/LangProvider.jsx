import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LangContext = createContext(null);

const DICT = {
  ar: {
    brand: "السوق الحر",
    home: "الرئيسية",
    offers: "العروض",
    stores: "المتاجر",
    categories: "الأقسام",
    menu: "القائمة",
    search: "بحث…",
    cart: "السلة",
    profile: "الملف الشخصي",
    signin: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    electronics: "الإلكترونيات",
    computers: "الحواسيب",
    books: "الكتب",
    games: "الألعاب",
    fashion: "الأزياء",
    listings: "الإعلانات",
    sell: "بيع",
  },
  en: {
    brand: "Free Market",
    home: "Home",
    offers: "Offers",
    stores: "Stores",
    categories: "Categories",
    menu: "Menu",
    search: "Search…",
    cart: "Cart",
    profile: "Profile",
    signin: "Sign in",
    signup: "Sign up",
    logout: "Log out",
    electronics: "Electronics",
    computers: "Computers",
    books: "Books",
    games: "Games",
    fashion: "Fashion",
    listings: "Listings",
    sell: "Sell",
  },
};

function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");

  useEffect(() => {
    localStorage.setItem("lang", lang);
    const isAr = lang === "ar";
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", isAr ? "rtl" : "ltr");
  }, [lang]);

  const t = useMemo(() => {
    const table = DICT[lang] || DICT.ar;
    return (key) => table[key] ?? key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
export default LangProvider;
