import type { InvoiceLine } from "~/types/invoice";

const r2 = (n: number) => Math.round(n * 100) / 100;

export function lineAmount(l: InvoiceLine) {
  const base = l.quantity * l.price;
  const afterDisc = base * (1 - (l.discount ?? 0) / 100);
  const withVat = afterDisc * (1 + l.vat / 100);
  return r2(withVat);
}

export function subtotal(lines: InvoiceLine[]) {
  return r2(lines.reduce((s, l) => s + l.quantity * l.price, 0));
}

export function discountTotal(lines: InvoiceLine[], globalDiscount = 0) {
  const perLine = lines.reduce(
    (s, l) => s + l.quantity * l.price * ((l.discount ?? 0) / 100),
    0
  );
  const sub = subtotal(lines);
  return r2(perLine + sub * (globalDiscount / 100));
}

export function vatTotal(lines: InvoiceLine[]) {
  const vat = lines.reduce((s, l) => {
    const base = l.quantity * l.price * (1 - (l.discount ?? 0) / 100);
    return s + base * (l.vat / 100);
  }, 0);
  return r2(vat);
}

export function total(lines: InvoiceLine[], globalDiscount = 0) {
  return r2(
    subtotal(lines) - discountTotal(lines, globalDiscount) + vatTotal(lines)
  );
}
