import { Outlet } from "react-router";
import Navbar from "@/components/UI/Navbar.jsx";
import Footer from "@/components/UI/Footer.jsx";
import { useModal } from '@/context/ModalContext';


const RootLayout = () => {

  const { open, setOpen } = useModal();

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {open && (
            <CreateReservationModal
                onClose={() => setOpen(false)}
                onSuccess={(data) => console.log('Reservation created:', data)}
            />
            )}
    </div>
  );
}

export default RootLayout
