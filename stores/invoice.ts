import { defineStore } from "pinia";
import type { InvoiceForm, InvoiceLine, UoM } from "~/types/invoice";
import { lineAmount, subtotal, discountTotal, vatTotal, total } from "~/utils/calc";

function id() {
  return Math.random().toString(36).slice(2, 9);
}

export const useInvoiceStore = defineStore("invoice", {
  state: (): {
    form: InvoiceForm;
    uoms: UoM[];
    vatOptions: number[];
    clients: string[];
  } => ({
    uoms: ["pcs", "kg", "hour"],
    vatOptions: [0, 5, 8, 15, 20],
    clients: ["General Construct", "Boris Expert", "Sirius Software"],
    form: {
      number: String(Date.now()).slice(-8),
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      from: { name: "Your Name", company: "Your Company", email: "you@mail.com" },
      to: { name: "Client", company: "General Construct", email: "client@mail.com" },
      bankDetails: "",
      notes: "",
      globalDiscount: 0,
      lines: [
        {
          id: id(),
          description: "Services of Marketing",
          quantity: 1,
          uom: "pcs",
          price: 24000,
          vat: 15,
          discount: 0,
        },
      ],
    },
  }),

  getters: {
    lineAmount: () => (l: InvoiceLine) => lineAmount(l),
    subtotal: (s) => subtotal(s.form.lines),
    discountTotal: (s) => discountTotal(s.form.lines, s.form.globalDiscount ?? 0),
    vatTotal: (s) => vatTotal(s.form.lines),
    total: (s) => total(s.form.lines, s.form.globalDiscount ?? 0),
    serialized: (s) => JSON.stringify(s.form),
  },

  actions: {
    addLine() {
      this.form.lines.push({
        id: id(),
        description: "",
        quantity: 1,
        uom: "pcs",
        price: 0,
        vat: 0,
        discount: 0,
      });
    },
    removeLine(id: string) {
      this.form.lines = this.form.lines.filter((l) => l.id !== id);
    },
    updateLine(id: string, patch: Partial<InvoiceLine>) {
      const i = this.form.lines.findIndex((l) => l.id === id);
      if (i !== -1) this.form.lines[i] = { ...this.form.lines[i], ...patch };
    },
  },
});