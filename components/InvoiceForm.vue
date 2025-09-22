<template>
  <section class="card p-4 md:p-6 space-y-6">
    <h2 class="text-lg font-semibold">Invoice details</h2>

    <div class="row">
      <div class="col-span-12 md:col-span-6">
        <label class="label">Invoice number</label>
        <input class="input mt-1" v-model="f.number" :class="{ '!border-red-500': invalid.number }" />
      </div>
      <div class="col-span-6 md:col-span-3">
        <label class="label">Issue date</label>
        <input class="input mt-1" type="date" v-model="f.issueDate" :class="{ '!border-red-500': invalid.issue }" />
      </div>
      <div class="col-span-6 md:col-span-3">
        <label class="label">Due date</label>
        <input class="input mt-1" type="date" v-model="f.dueDate" :class="{ '!border-red-500': invalid.due }" />
      </div>
    </div>

    <div class="row">
      <div class="col-span-12 md:col-span-6">
        <label class="label">From</label>
        <input class="input mt-1" placeholder="Name" v-model="f.from.name" :class="{ '!border-red-500': invalid.from }" />
        <input class="input mt-2" placeholder="Company" v-model="f.from.company" />
        <input class="input mt-2" placeholder="Email" v-model="f.from.email" />
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="label">To</label>
        <input class="input mt-1" placeholder="Name" v-model="f.to.name" :class="{ '!border-red-500': invalid.to }" />
        <input class="input mt-2" placeholder="Company" v-model="f.to.company" />
        <input class="input mt-2" placeholder="Email" v-model="f.to.email" />
      </div>
    </div>

    <div class="space-y-2">
      <h3 class="font-semibold">Products and services</h3>

      <div v-for="line in f.lines" :key="line.id" class="grid grid-cols-12 gap-2 items-end">
        <div class="col-span-12 md:col-span-4">
          <label class="label">Description</label>
          <input class="input mt-1" v-model="line.description" />
        </div>

        <div class="col-span-4 md:col-span-2">
          <label class="label">Quantity</label>
          <input class="input mt-1" type="number" min="0" step="0.01" inputmode="decimal" v-model.number="line.quantity"
            @blur="line.quantity = clampNum(line.quantity, 0)" />
        </div>

        <div class="col-span-4 md:col-span-2">
          <BaseSelect class="mt-1" label="UoM" v-model="line.uom" :options="uoms" />
        </div>

        <div class="col-span-4 md:col-span-2">
          <label class="label">Price/Unit</label>
          <input class="input mt-1" type="number" min="0" step="0.01" inputmode="decimal" v-model.number="line.price"
            @blur="line.price = clampNum(line.price, 0)" />
        </div>

        <div class="col-span-4 md:col-span-1">
          <BaseSelect class="mt-1" label="VAT" v-model="line.vat" :options="vatOptions" />
        </div>

        <div class="col-span-4 md:col-span-1">
          <label class="label">Disc %</label>
          <input class="input mt-1" type="number" min="0" max="100" step="1" inputmode="numeric"
            v-model.number="line.discount" @blur="line.discount = clampNum(line.discount ?? 0, 0)" />
        </div>

        <div class="col-span-8 md:col-span-2">
          <label class="label">Amount</label>
          <input class="input mt-1 bg-zinc-100 tabular-nums" :value="fmt(amountOf(line))" disabled />
        </div>

        <div class="col-span-4 md:col-span-1 flex justify-end">
          <button class="btn-outline mt-6" @click="remove(line.id)">−</button>
        </div>
      </div>

      <button class="btn-outline" @click="add">Add line</button>
    </div>

    <div class="row">
      <div class="col-span-12 md:col-span-6">
        <label class="label">Bank details</label>
        <textarea class="input mt-1 h-28" v-model="f.bankDetails" placeholder="Write your bank details" />
      </div>

      <div class="col-span-12 md:col-span-6 space-y-2">
        <div class="flex items-center gap-2">
          <span class="label">Discount %</span>
          <input class="input w-28" type="number" min="0" max="100" inputmode="numeric"
            v-model.number="f.globalDiscount" @blur="f.globalDiscount = clampNum(f.globalDiscount ?? 0, 0)" />
        </div>

        <div class="bg-zinc-50 rounded-xl p-3 text-sm tabular-nums">
          <div class="flex justify-between"><span>Subtotal</span><b>{{ fmt(subTotal) }}</b></div>
          <div class="flex justify-between"><span>Discount</span><b>-{{ fmt(discount) }}</b></div>
          <div class="flex justify-between"><span>VAT</span><b>{{ fmt(vat) }}</b></div>
          <div class="flex justify-between text-lg pt-2 border-t mt-2"><span>Total</span><b>{{ fmt(totalSum) }}</b>
          </div>
        </div>
      </div>
    </div>

    <div>
      <label class="label">Notes (optional)</label>
      <textarea class="input mt-1" v-model="f.notes" placeholder="Add notes" />
    </div>
  </section>
</template>

<script setup lang="ts">
  import BaseSelect from '~/components/BaseSelect.vue'
  import { storeToRefs } from 'pinia'
  import { useInvoiceStore } from '~/stores/invoice'
  import type { InvoiceLine } from '~/types/invoice'

  const emit = defineEmits<{ (e: 'invalid-change', v: boolean): void }>()

  const s = useInvoiceStore()
  const { form: f, uoms, vatOptions } = storeToRefs(s)

  const add = () => s.addLine()
  const remove = (id: string) => s.removeLine(id)
  const amountOf = (l: InvoiceLine) => s.lineAmount(l)
  const fmt = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(n)

  // вычисляемые тоталы
  const subTotal = computed(() => s.subtotal)
  const vat = computed(() => s.vatTotal)
  const discount = computed(() => s.discountTotal)
  const totalSum = computed(() => s.total)

  // простая валидация
  const required = (v?: string) => !!v && v.trim().length > 0
  const invalid = computed(() => ({
    number: !required(f.value.number),
    issue: !required(f.value.issueDate),
    due: !required(f.value.dueDate),
    from: !required(f.value.from.name),
    to: !required(f.value.to.name),
  }))
  const invalidAny = computed(() => Object.values(invalid.value).some(Boolean))
  watch(invalidAny, v => emit('invalid-change', v), { immediate: true })

  // нормализация чисел
  function clampNum(v: number, min = 0) {
    if (Number.isNaN(v)) return min
    return v < min ? min : v
  }
</script>