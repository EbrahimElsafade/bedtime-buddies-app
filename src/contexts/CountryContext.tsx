import React, { createContext, useContext } from 'react';
import { useUserCountry, UseUserCountryReturn } from '@/hooks/useUserCountry';

interface CountryContextType {
  countryCode: string | null;
  countryName: string | null;
  loading: boolean;
  error: string | null;
}

const CountryContext = createContext<CountryContextType>({
  countryCode: null,
  countryName: null,
  loading: true,
  error: null,
});

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const country: UseUserCountryReturn = useUserCountry();

  return (
    <CountryContext.Provider value={country}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextType => {
  return useContext(CountryContext);
};
