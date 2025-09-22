<template>
  <aside class="card p-4 md:p-6">
    <h2 class="text-lg font-semibold mb-4">Preview</h2>

    <div v-if="p" class="bg-white border rounded-xl p-4 text-sm space-y-3">
      <div class="flex justify-between flex-wrap gap-2">
        <div>
          <div class="text-xs text-zinc-500">Invoice #</div>
          <div class="font-semibold">{{ p.number }}</div>
        </div>
        <div class="text-right">
          <div>Issue: {{ p.issueDate }}</div>
          <div>Due: {{ p.dueDate }}</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="text-xs text-zinc-500">From</div>
          <div class="font-medium">{{ p.from.name }}</div>
          <div>{{ p.from.company }}</div>
          <div>{{ p.from.email }}</div>
        </div>
        <div>
          <div class="text-xs text-zinc-500">To</div>
          <div class="font-medium">{{ p.to.name }}</div>
          <div>{{ p.to.company }}</div>
          <div>{{ p.to.email }}</div>
        </div>
      </div>

      <table class="w-full text-left border-t mt-2">
        <thead>
          <tr class="text-xs text-zinc-500">
            <th class="py-2">Description</th>
            <th>Qty</th>
            <th>UoM</th>
            <th>Price</th>
            <th>VAT</th>
            <th>Disc</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in p.lines" :key="l.id" class="border-t">
            <td class="py-2">{{ l.description }}</td>
            <td>{{ l.quantity }}</td>
            <td>{{ l.uom }}</td>
            <td class="tabular-nums">{{ fmt(l.price) }}</td>
            <td>{{ l.vat }}%</td>
            <td>{{ l.discount ?? 0 }}%</td>
            <td class="text-right tabular-nums">{{ fmt(lineAmount(l)) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="border-t pt-2 space-y-1 tabular-nums">
        <div class="flex justify-between"><span>Subtotal</span><b>{{ fmt(subtotal) }}</b></div>
        <div class="flex justify-between"><span>Discount</span><b>-{{ fmt(discount) }}</b></div>
        <div class="flex justify-between"><span>VAT</span><b>{{ fmt(vat) }}</b></div>
        <div class="flex justify-between text-lg pt-2 border-t mt-2"><span>Total</span><b>{{ fmt(total) }}</b></div>
      </div>

      <div v-if="p.bankDetails" class="border-t pt-2">
        <div class="text-xs text-zinc-500">Bank details</div>
        <pre class="whitespace-pre-wrap text-xs">{{ p.bankDetails }}</pre>
      </div>

      <div v-if="p.notes" class="border-t pt-2">
        <div class="text-xs text-zinc-500">Notes</div>
        <div class="text-xs">{{ p.notes }}</div>
      </div>
    </div>
    
    <div v-else class="bg-white border rounded-xl p-4 text-sm text-center text-zinc-500">
      Loading preview...
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia'
  import { useInvoiceStore } from '~/stores/invoice'
  import { useDebounce } from '~/composables/useDebounce'
  import type { InvoiceForm, InvoiceLine } from '~/types/invoice'

  const s = useInvoiceStore()
  const { serialized } = storeToRefs(s)

  const p = ref<InvoiceForm | null>(null)

  // Initialize with store data if available
  onMounted(() => {
    if (s.form) {
      p.value = JSON.parse(JSON.stringify(s.form))
    }
  })
  
  const update = useDebounce((json: string) => { 
    try {
      p.value = JSON.parse(json) 
    } catch (e) {
      console.error('Failed to parse invoice data:', e)
    }
  }, 300)
  watch(serialized, (v) => update(v))

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n)
  const lineAmount = (l: InvoiceLine) => s.lineAmount(l)
  const subtotal = computed(() => s.subtotal)
  const discount = computed(() => s.discountTotal)
  const vat = computed(() => s.vatTotal)
  const total = computed(() => s.total)
</script>