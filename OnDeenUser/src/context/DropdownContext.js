// contexts/DropdownContext.js
import React, { createContext, useState, useContext } from 'react';

const DropdownContext = createContext();

export const DropdownProvider = ({ children }) => {
  const [dropdownState, setDropdownState] = useState({
    isVisible: false,
    screenId: null, // To track which screen's dropdown is open
    position: { x: 0, y: 0 }, // Optional: for positioning
  });


  const openDropdown = (screenId, position = { x: 0, y: 0 }) => {
    setDropdownState({
      isVisible: true,
      screenId,
      position,
    });
  };

  const closeDropdown = () => {
    setDropdownState(prev => ({ ...prev, isVisible: false }));
  };

  const toggleDropdown = (screenId, position = { x: 0, y: 0 }) => {
    if (dropdownState.isVisible) {
      closeDropdown();
    } else {
      openDropdown(screenId, position);
    }
  };

  return (
    <DropdownContext.Provider
      value={{
        dropdownState,
        openDropdown,
        closeDropdown,
        toggleDropdown,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
};