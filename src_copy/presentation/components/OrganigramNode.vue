<template>
  <div 
    class="flex flex-col items-center justify-center p-4 rounded-lg shadow-sm text-center w-48 relative no-border"
    :class="[color, 'text-white']"
  >
    <div class="font-bold font-display text-sm mb-1 leading-tight">{{ node.name }}</div>
    <div class="text-xs uppercase tracking-wider font-body opacity-80">{{ node.role }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  node: { name: string, role: string };
  color: string;
}>();
</script>
