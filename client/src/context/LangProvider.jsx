import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LangContext = createContext(null);

const DICT = {
  ar: {
    brand: "السوق الحر",
    admin: "الإدارة",
    dashboard: "لوحة التحكم",
    home: "الرئيسية",
    offers: "العروض",
    stores: "المتاجر",
    categories: "الأقسام",
    menu: "القائمة",
    search: "بحث…",
    Manage: "إدارة",
    Actions: "إجراءات",
    Approve: "قبول",
    Reject: "رفض",
    Activate: "تفعيل",
    Deactivate: "تعطيل",
    First: "الاسم",
    Last: "الكنية",
    Phone: "الهاتف",
    Role: "الدور",
    Status: "الحالة",
    refresh: "تحديث",
    addNew: "إضافة جديد",
    create: "إنشاء",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    noItems: "لا توجد عناصر",
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
    "Become a Partner": "كن شريكاً",
    "Partner with us": "كن شريكاً معنا",
    Name: "الاسم",
    Email: "البريد الإلكتروني",
    Phone: "الهاتف",
    Submit: "إرسال",
    "Business Field": "مجال العمل",
    "Shipping Options": "خيارات الشحن",
    "Preferred Payments": "طرق الدفع المفضلة",
    Message: "رسالتك",
    Users: "المستخدمون",
    Stores: "المتاجر",
    Products: "المنتجات",
    ManageProducts: "إدارة المنتجات",
    ManageCategories: "إدارة الأقسام",
    ManageCollections: "إدارة المجموعات",
    ManageMedia: "إدارة الوسائط",
    ManageListings: "إدارة الإعلانات",
    ManageListingOffers: "عروض الإعلانات",
    ManageListingPromotions: "ترقيات الإعلانات",
    ManageReports: "إدارة البلاغات",
    Categories: "الأقسام",
    Listings: "الإعلانات",
    Reports: "البلاغات",
    Media: "الوسائط",
  },
  en: {
    brand: "Free Market",
    admin: "Admin",
    dashboard: "Dashboard",
    home: "Home",
    offers: "Offers",
    stores: "Stores",
    categories: "Categories",
    menu: "Menu",
    search: "Search…",
    Manage: "Manage",
    Actions: "Actions",
    Approve: "Approve",
    Reject: "Reject",
    Activate: "Activate",
    Deactivate: "Deactivate",
    First: "First",
    Last: "Last",
    Phone: "Phone",
    Role: "Role",
    Status: "Status",
    refresh: "Refresh",
    addNew: "Add new",
    create: "Create",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    noItems: "No items",
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
    "Become a Partner": "Become a Partner",
    "Partner with us": "Partner with us",
    Name: "Name",
    Email: "Email",
    Phone: "Phone",
    Submit: "Submit",
    "Business Field": "Business Field",
    "Shipping Options": "Shipping Options",
    "Preferred Payments": "Preferred Payments",
    Message: "Message",
    Users: "Users",
    Stores: "Stores",
    Products: "Products",
    ManageProducts: "Manage Products",
    ManageCategories: "Manage Categories",
    ManageCollections: "Manage Collections",
    ManageMedia: "Manage Media",
    ManageListings: "Manage Listings",
    ManageListingOffers: "Manage Listing Offers",
    ManageListingPromotions: "Manage Listing Promotions",
    ManageReports: "Manage Reports",
    Categories: "Categories",
    Listings: "Listings",
    Reports: "Reports",
    Media: "Media",
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
