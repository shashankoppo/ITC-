import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  availableCities: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const AVAILABLE_CITIES = [
  'India', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Hyderabad', 
  'Chennai', 'Kolkata', 'Ahmedabad', 'Gurugram', 'Chandigarh', 'Jaipur', 'Lucknow', 'Noida'
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCityState] = useState('India');

  useEffect(() => {
    loadSavedLocation();
  }, []);

  const loadSavedLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem('selected_location');
      if (savedLocation) {
        setSelectedCityState(savedLocation);
      }
    } catch (error) {
      console.error('Error loading saved location:', error);
    }
  };

  const setSelectedCity = async (city: string) => {
    try {
      setSelectedCityState(city);
      await AsyncStorage.setItem('selected_location', city);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  return (
    <LocationContext.Provider value={{ selectedCity, setSelectedCity, availableCities: AVAILABLE_CITIES }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
