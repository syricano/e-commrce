// src/context/ModalContext.jsx
import { createContext, useContext, useState } from "react";

const ModalContext = createContext({ open: false, setOpen: () => {} });

export const useModal = () => useContext(ModalContext);

const ModalProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
