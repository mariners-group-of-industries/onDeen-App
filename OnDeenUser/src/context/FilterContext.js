import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [hithomepageapi, setHithomepageapi] = useState(1)

  // Define initial filter state separately so we can reuse it for reset
  const initialFilterState = {
    category_id: [],
    start_date: '',
    end_date: '',
    address: '',
    journey_level_id: [],
    organizer_id: [],
    price_type: [],
    sort_Filter: [1],
    speaker_id: [],
    gender_id: [],
    location: [],
    latitude: '',
    longitude: '',
    keyword: '',
    location_type: '',
    date_type: '',
    status: 1,
  };

  const [filter1, setFilterState] = useState(initialFilterState);

  // Using ref to store the debounce timer
  const debounceTimer = useRef(null);

  // Stable setFilter1 function with proper debouncing
  const setFilter1 = useCallback((key, value) => {
    // Clear any pending updates
    setFilterState(prev => {
      // Deep comparison to prevent unnecessary updates
      if (JSON.stringify(prev[key]) == JSON.stringify(value)) {
        return prev;
      }

      const newState = { ...prev, [key]: value };
      console.groupCollapsed(`Filter Update: ${key}`);
      console.log('Previous:', prev[key]);
      console.log('New:', value);
      console.log('Full state:', newState);
      console.groupEnd();
      return newState;
    });
  }, []);

  // Reset all filters to initial state except latitude and longitude
  const resetFilter = useCallback(() => {
    console.log('Resetting all filters except latitude/longitude');
    setFilterState(prev => ({
      ...initialFilterState,
      latitude: prev.latitude, // Keep existing latitude
      longitude: prev.longitude, // Keep existing longitude
    }));
    setHithomepageapi(1);
  }, [initialFilterState]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debugging effect - log full state when it changes
  // useEffect(() => {
  //   console.log('Current Filter State:', filter1);
  // }, [filter1]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    filter1,
    setFilter1,
    hithomepageapi,
    setHithomepageapi,
    resetFilter // Add reset method to context
  }), [filter1, setFilter1, hithomepageapi, setHithomepageapi, resetFilter]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};