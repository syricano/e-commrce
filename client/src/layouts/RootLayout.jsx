import { Outlet } from "react-router-dom";
import Navbar from "@/components/UI/Navbar.jsx";
import Footer from "@/components/UI/Footer.jsx";
import MiniCart from "@/components/cart/MiniCart.jsx";
import { Toaster } from "react-hot-toast";
import { useLang } from "@/context/LangProvider";

function RootLayout() {
  const { lang } = useLang();
  const toastPos = (lang === 'ar') ? 'top-left' : 'top-right';

  return (
    <>
      <Toaster position={toastPos} />
      <header>
        <Navbar />
        <MiniCart />
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default RootLayout;
