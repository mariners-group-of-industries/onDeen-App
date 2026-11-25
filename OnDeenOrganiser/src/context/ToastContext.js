import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/toastMessage';
const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); 
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast message={toastMessage} />
    </ToastContext.Provider>
  );
};
