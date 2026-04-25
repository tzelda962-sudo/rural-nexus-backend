<template>
  <div class="min-h-screen flex flex-col font-body bg-surface text-on-surface">
    <GlobalHeader />
    
    <main class="flex-grow">
      <slot />
    </main>

    <GlobalFooter />
  </div>
</template>

<script setup>
// Layouts in Nuxt are auto-imported, but GlobalHeader and GlobalFooter are assumed auto-imported components
</script>
