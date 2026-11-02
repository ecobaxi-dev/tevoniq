import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/max';

const countries = getCountries();
const aliases = new Map<string, CountryCode>();
const key = (value: string) => value.normalize('NFKC').trim().toLowerCase();
for (const code of countries) {
  aliases.set(key(code), code);
  for (const locale of ['ar', 'en', 'tr']) {
    const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code);
    if (name) aliases.set(key(name), code);
  }
}
for (const name of ['Turkey', 'Türkiye', 'Turkiye', 'تركيا']) aliases.set(key(name), 'TR');
export const leadCountryCode = (value: string) => aliases.get(key(value));
export function leadCountries(locale: 'ar' | 'en' | 'tr') {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  return countries
    .map((code) => ({
      code,
      name: names.of(code) || code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
export function normalizeLeadPhone(value: string, country: string): string | undefined {
  const digits = value
    .normalize('NFKC')
    .replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) - (digit <= '٩' ? 0x660 : 0x6f0)))
    .trim();
  if (!/^[+\d\s().-]{5,50}$/.test(digits)) return;
  const defaultCountry = leadCountryCode(country);
  if (!defaultCountry) return;
  const phone = parsePhoneNumberFromString(digits.replace(/^00/, '+'), {
    defaultCountry,
    extract: false,
  });
  return phone?.isValid() && !phone.ext ? phone.number : undefined;
}
