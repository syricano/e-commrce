import { Outlet } from "react-router";
import Navbar from "@/components/UI/Navbar.jsx";
import Footer from "@/components/UI/Footer.jsx";
import { Toaster } from "react-hot-toast";

function RootLayout() {
  return (
    <>
      <Toaster position="top-center" />
      <header><Navbar /></header>
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

export default RootLayout;
