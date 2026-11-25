export const stripCountryCodePlus = (countryCode?: string | number | null) =>
  String(countryCode ?? '').replace(/^\++/, '');
