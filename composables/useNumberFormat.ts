export function useNumberFormat(locale = 'ru-RU', maximumFractionDigits = 2) {
  const formatter = new Intl.NumberFormat(locale, { maximumFractionDigits });
  const format = (value: number) => formatter.format(value);
  return { format };
}