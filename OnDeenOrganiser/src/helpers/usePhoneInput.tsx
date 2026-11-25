import {useState, useCallback} from 'react';
import {Country} from '../types/Country';

interface UsePhoneInputResult {
  countryCode: string;
  country: string | null;
  handleCountrySelect: (
    selectedCountry: Country,
    setFieldValue: (field: string, value: any) => void,
  ) => void;
}

export const usePhoneInput = (
  initialCountryCode: string = '+1',
  initialCountry: string = 'United States',
): UsePhoneInputResult => {
  const [countryCode, setCountryCode] = useState<string>(initialCountryCode);
  const [country, setCountry] = useState<string | null>(initialCountry);

  const handleCountrySelect = useCallback(
    (
      selectedCountry: Country,
      setFieldValue: (field: string, value: any) => void,
    ) => {
      setCountry(selectedCountry.name);
      setCountryCode(`+${selectedCountry.country_code[0]}`);
      setFieldValue('country', selectedCountry.name);
      setFieldValue('countryCode', `+${selectedCountry.country_code[0]}`);
    },
    [],
  );

  return {countryCode, country, handleCountrySelect};
};
