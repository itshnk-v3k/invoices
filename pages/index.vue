<template>
  <main class="max-w-7xl mx-auto p-3 md:p-6">
    <header class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button class="btn-outline" aria-label="Back">←</button>
        <h1 class="text-xl font-semibold">New Invoice</h1>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-outline">Attach file</button>
        <button class="btn" :disabled="isInvalid">Save invoice</button>
      </div>
    </header>

    <!-- Mobile-first: форма сверху, превью снизу; на md+ — 2 колонки -->
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 md:col-span-7 lg:col-span-8 order-1">
        <InvoiceForm @invalid-change="isInvalid = $event" />
      </div>
      <div
        class="col-span-12 md:col-span-5 lg:col-span-4 order-2 md:sticky md:top-4 md:h-[calc(100dvh-4rem)] md:overflow-auto">
        <InvoicePreview />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
  import InvoiceForm from '../components/InvoiceForm.vue'
  import InvoicePreview from '../components/InvoicePreview.vue'

  const isInvalid = ref(false)
</script>