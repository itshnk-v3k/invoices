export type UoM = 'pcs' | 'kg' | 'hour'

export interface InvoiceParty {
  name: string
  company?: string
  email?: string
}

export interface InvoiceLine {
  id: string
  description: string
  quantity: number
  uom: UoM
  price: number
  vat: number
  discount?: number
}

export interface InvoiceForm {
  number: string
  issueDate: string
  dueDate: string
  from: InvoiceParty
  to: InvoiceParty
  bankDetails: string
  notes?: string
  lines: InvoiceLine[]
  globalDiscount?: number
}