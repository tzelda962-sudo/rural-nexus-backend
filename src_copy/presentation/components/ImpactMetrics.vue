<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  Users, 
  Orbit, 
  ShieldCheck, 
  Globe2 
} from 'lucide-vue-next';

interface Metric {
  value: number
  suffix: string
  label: string
  description: string
  icon: any
  color: string
}

const metrics: Metric[] = [
  {
    value: 12500,
    suffix: '+',
    label: 'Lives Impacted',
    description: 'Direct fellows and regional beneficiaries reached through transdisciplinary nexus points.',
    icon: Users,
    color: 'from-emerald-500 to-leaf-500'
  },
  {
    value: 64,
    suffix: '',
    label: 'Active Nodes',
    description: 'Context-specific research units operational across 12 strategic rural ecosystems.',
    icon: Orbit,
    color: 'from-leaf-500 to-cyan-500'
  },
  {
    value: 100,
    suffix: '%',
    label: 'Transparency',
    description: 'Every resource and allocation is tracked in our open intelligence ledger.',
    icon: ShieldCheck,
    color: 'from-cyan-500 to-emerald-500'
  },
]

const displayed = ref<number[]>(metrics.map(() => 0))
const sectionRef = ref<HTMLElement | null>(null)
const animated = ref(false)

function animateCounts() {
  if (animated.value) return
  animated.value = true

  const duration = 2000
  const start = performance.now()

  function tick(now: number) {
    const progress = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4) // Quartic ease out
    displayed.value = metrics.map(m => Math.round(m.value * eased))
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

onMounted(() => {
  if (!sectionRef.value || typeof IntersectionObserver === 'undefined') {
    animateCounts()
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animateCounts()
          observer.disconnect()
          break
        }
      }
    },
    { threshold: 0.2 },
  )
  observer.observe(sectionRef.value)
})

function formatNumber(n: number) {
  return n.toLocaleString('en-US')
}
</script>

<template>
  <section ref="sectionRef" class="relative bg-surface overflow-hidden py-32">
    <!-- Abstract Background -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none">
      <div class="absolute right-0 top-0 w-[600px] h-[600px] hex-mask bg-primary translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute left-0 bottom-0 w-[400px] h-[400px] hex-mask border-2 border-primary -translate-x-1/3 translate-y-1/3"></div>
    </div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3x text-center mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-8">
           <Globe2 class="w-3.5 h-3.5" /> Global Footprint
        </div>
        <h2 class="font-display text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6">
          Measurable Change, <span class="text-primary italic">Verified in the Open.</span>
        </h2>
        <p class="font-body text-lg text-on-surface-variant opacity-70 max-w-2xl mx-auto leading-relaxed">
          We quantify every outcome—from node health to community sovereignty—because trust in a nexus is built on data, not just narratives.
        </p>
      </div>

      <div class="grid gap-12 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(metric, i) in metrics"
          :key="metric.label"
          class="group relative flex flex-col p-1"
        >
          <div class="absolute -inset-1 bg-gradient-to-br opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-xl transition duration-500" :class="metric.color"></div>
          
          <div class="relative flex flex-col bg-white rounded-[40px] p-10 border border-outline-variant/10 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div class="w-16 h-16 hex-mask flex items-center justify-center text-white mb-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" :class="metric.color">
               <component :is="metric.icon" class="w-7 h-7" />
            </div>

            <p class="font-display text-5xl font-bold tracking-tighter text-on-surface mb-4">
              {{ formatNumber(displayed[i] ?? 0) }}<span class="text-primary">{{ metric.suffix }}</span>
            </p>
            
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              {{ metric.label }}
            </p>
            
            <p class="font-body text-sm leading-relaxed text-on-surface-variant opacity-60">
              {{ metric.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}
</style>
te>
