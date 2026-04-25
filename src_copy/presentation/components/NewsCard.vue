<template>
  <div class="p-5 bg-surface-container-low rounded-lg transition-transform hover:-translate-y-1 hover:bg-surface-container-highest flex gap-4 items-start">
    <div class="flex-shrink-0 w-16 h-16 bg-surface-variant rounded flex flex-col items-center justify-center text-primary-container">
      <span class="text-xs font-bold uppercase">{{ month }}</span>
      <span class="text-xl font-display font-bold">{{ day }}</span>
    </div>
    <div>
      <h4 class="font-display font-semibold text-on-surface mb-2 leading-tight">
        {{ event.title }}
      </h4>
      <p class="text-sm font-body text-on-surface-variant line-clamp-2">
        {{ event.summary }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NewsEvent } from '@domain/repositories/INewsEventRepository';

const props = defineProps<{
  event: NewsEvent;
}>();

const dateParts = computed(() => {
  // Mock '21.01.2026' => { day: 21, month: Jan }
  const parts = props.event.date.split('.');
  if (parts.length === 3) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return {
      day: parts[0] || '00',
      month: months[parseInt(parts[1] || '1', 10) - 1] || 'MTH'
    }
  }
  return { day: '00', month: 'XXX' };
});

const day = computed(() => dateParts.value.day);
const month = computed(() => dateParts.value.month);
</script>
