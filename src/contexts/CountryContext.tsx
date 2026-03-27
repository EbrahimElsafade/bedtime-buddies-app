import React, { createContext, useContext } from 'react';
import { CountryData, useUserCountry } from '@/hooks/useUserCountry';

const CountryContext = createContext<CountryData | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const countryState = useUserCountry();

  return <CountryContext.Provider value={countryState}>{children}</CountryContext.Provider>;
};

export const useCountry = (): CountryData => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within CountryProvider');
  }

  return context;
};
