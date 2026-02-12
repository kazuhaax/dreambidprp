import { createContext, useState, useContext, useEffect } from 'react';

const ShortlistContext = createContext();

export function ShortlistProvider({ children }) {
  const [shortlistedProperties, setShortlistedProperties] = useState(() => {
    // Load from localStorage on initialization
    try {
      const saved = localStorage.getItem('dreambid_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever shortlist changes
  useEffect(() => {
    localStorage.setItem('dreambid_shortlist', JSON.stringify(shortlistedProperties));
  }, [shortlistedProperties]);

  const toggleShortlist = (propertyId) => {
    setShortlistedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      } else {
        return [...prev, propertyId];
      }
    });
  };

  const isShortlisted = (propertyId) => {
    return shortlistedProperties.includes(propertyId);
  };

  const getShortlistedCount = () => {
    return shortlistedProperties.length;
  };

  const clearShortlist = () => {
    setShortlistedProperties([]);
  };

  return (
    <ShortlistContext.Provider value={{
      shortlistedProperties,
      toggleShortlist,
      isShortlisted,
      getShortlistedCount,
      clearShortlist,
    }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (!context) {
    throw new Error('useShortlist must be used within ShortlistProvider');
  }
  return context;
}
