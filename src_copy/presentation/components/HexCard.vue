<template>
  <div 
    class="relative group rounded-xl p-6 bg-surface-container-low transition-all duration-300 hover:bg-surface-container-highest no-border"
  >
    <!-- Left Accent Bar on Hover -->
    <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 origin-center group-hover:scale-y-100 transition-transform duration-300 rounded-l-xl"></div>
    
    <!-- Hexagonal Icon Mask -->
    <div 
      class="w-16 h-16 hex-mask flex items-center justify-center text-white mb-6 transition-transform group-hover:scale-110 duration-300"
      :class="colorClass"
    >
      <!-- We use Lucide icons ideally, but fallback to simple shapes for mockup -->
      <span class="font-bold text-xl">{{ iconInitial }}</span>
    </div>

    <!-- Content -->
    <h3 class="font-display font-semibold text-xl mb-3 text-on-surface">{{ title }}</h3>
    <p class="font-body text-on-surface-variant leading-relaxed text-sm">
      {{ description }}
    </p>

    <!-- Hover 'Learn More' CTA -->
    <div class="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary font-medium text-sm">
      Learn More
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  colorTheme: { type: String, default: 'primary' },
});

const colorClass = computed(() => {
  const map: Record<string, string> = {
    cyan: 'bg-cyan',
    primary: 'bg-primary-container',
    navy: 'bg-navy',
    amber: 'bg-amber',
    leaf: 'bg-leaf',
  };
  return map[props.colorTheme] || 'bg-primary-container';
});

const iconInitial = computed(() => {
  return props.title.charAt(0).toUpperCase();
});
</script>
