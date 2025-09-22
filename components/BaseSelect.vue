<template>
  <label class="block">
    <span v-if="label" class="label">
      {{ label }}
    </span>

    <select class="input" 
      :value="modelValue"
      @change="$emit('update:modelValue', cast(($event.target as HTMLSelectElement).value))">
      <option 
        v-for="opt in options" :key="String(opt)" 
        :value="String(opt)">
        {{ opt }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
  defineProps<{
    label?: string
    modelValue: string | number
    options: (string | number)[]
  }>();

  defineEmits<{ (e: 'update:modelValue', v: string | number): void }>();

  function cast(v: string) {
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  }
</script>