// src/layouts/RootLayout.jsx
import { Outlet } from "react-router";
import Navbar from "@/components/UI/Navbar.jsx";
import Footer from "@/components/UI/Footer.jsx";
import { useModal } from "@/context/ModalContext.jsx";

const RootLayout = () => {
  const { open, setOpen } = useModal();

  return (
    <>
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
      {open ? (
        <CreateReservationModal
          onClose={() => setOpen(false)}
          onSuccess={(data) => console.log("Reservation created:", data)}
        />
      ) : null}
    </>
  );
};

export default RootLayout;
