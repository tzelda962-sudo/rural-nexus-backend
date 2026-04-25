<script setup lang="ts">
interface Props {
  title: string
  description: string
  location: string
  raised: number
  goal: number
  tag: string
  // A tailwind gradient class pair used in place of a real image.
  gradient?: string
}

const props = withDefaults(defineProps<Props>(), {
  gradient: 'from-brand-600 to-leaf-500',
})

const percent = computed(() =>
  Math.min(100, Math.round((props.raised / props.goal) * 100)),
)

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
</script>

<template>
  <article class="group flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <!-- Image placeholder -->
    <div
      class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br"
      :class="gradient"
    >
      <div class="absolute inset-0 opacity-30 mix-blend-overlay" style="background-image: radial-gradient(circle at 30% 40%, white 0, transparent 45%), radial-gradient(circle at 70% 70%, white 0, transparent 40%);" />
      <svg aria-hidden="true" class="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern :id="`c-${title.replace(/\s+/g, '-')}`" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="white" stroke-width="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" :fill="`url(#c-${title.replace(/\s+/g, '-')})`" />
      </svg>
      <div class="absolute left-4 top-4 flex items-center gap-2">
        <span class="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-700">
          {{ tag }}
        </span>
      </div>
      <div class="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-semibold text-white/90">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
          <path d="M12 21s-7-4.5-7-11a7 7 0 0 1 14 0c0 6.5-7 11-7 11Z" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        {{ location }}
      </div>
    </div>

    <div class="flex flex-1 flex-col p-6">
      <h3 class="text-xl font-bold text-brand-900">{{ title }}</h3>
      <p class="mt-2 flex-1 text-sm leading-relaxed text-brand-900/70">
        {{ description }}
      </p>

      <!-- Progress -->
      <div class="mt-6">
        <div class="flex items-end justify-between text-sm">
          <span class="font-bold text-brand-900">
            {{ formatCurrency(raised) }}
            <span class="font-normal text-brand-900/60">
              raised of {{ formatCurrency(goal) }}
            </span>
          </span>
          <span class="font-bold text-leaf-600">{{ percent }}%</span>
        </div>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-brand-100">
          <div
            class="h-full rounded-full bg-gradient-to-r from-leaf-500 to-brand-500 transition-[width] duration-700"
            :style="{ width: `${percent}%` }"
          />
        </div>
      </div>

      <NuxtLink
        to="/donate"
        class="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
      >
        Support this campaign
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </article>
</template>
