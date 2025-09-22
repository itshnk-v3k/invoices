<template>
  <main class="max-w-[1378px] mx-auto p-3 md:p-6">
    <header class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <h1 class="text-xl font-semibold">Invoice</h1>
      </div>

      <div class="flex items-center gap-2">
        <button class="btn-outline">
          <span>Attach file</span>
        </button>

        <button class="save-invoice" :disabled="isInvalid">
          <span>Save invoice</span>
        </button>
      </div>
    </header>

    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12 min-[850px]:col-span-7 lg:col-span-8 order-1">
        <InvoiceForm @invalid-change="isInvalid = $event" />
      </div>

      <div
        class="preview-block">
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