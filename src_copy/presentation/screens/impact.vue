<script setup lang="ts">
useHead({ title: 'Impact Metrics — RuralNexus' })
</script>

<template>
  <div class="bg-surface min-h-screen">
    <!-- Premium Header -->
    <section class="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
      <div class="max-w-3xl">
        <p class="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-6">Quantifiable Change</p>
        <h1 class="font-display text-5xl md:text-6xl font-bold tracking-tight text-on-surface mb-8">
          The Intelligence <span class="text-primary italic">behind the mission.</span>
        </h1>
        <p class="font-body text-lg md:text-xl text-on-surface-variant opacity-70 leading-relaxed max-w-2xl">
          We publish every outcome—from node health metrics to direct economic shifts—within our open intelligence network. Below is a snapshot of our evidence-based footprint.
        </p>
      </div>
    </section>

    <ImpactMetrics />
    
    <!-- Verified Outcomes Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
         <div class="bg-surface-container-low rounded-[48px] p-12 md:p-20 relative overflow-hidden">
            <div class="absolute right-0 top-0 w-64 h-64 hex-mask bg-primary opacity-5 -translate-y-1/2 translate-x-1/2"></div>
            <div class="grid lg:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 class="font-display text-3xl md:text-4xl font-bold text-on-surface mb-6">Open Assessment Protocol</h2>
                  <p class="font-body text-on-surface-variant opacity-70 leading-relaxed mb-8">
                    Our impact data is verified through a transdisciplinary assessment protocol that combines regional field reports with satellite-verified agronomic shifts. We don't just report success; we share the lessons.
                  </p>
                  <NuxtLink to="/research" class="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest group">
                    Explore Methodologies
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="transition-transform group-hover:translate-x-1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </NuxtLink>
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <div class="p-8 bg-white rounded-3xl border border-outline-variant/10">
                     <p class="text-2xl font-display font-bold text-primary mb-1">100%</p>
                     <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Geographical Data</p>
                  </div>
                  <div class="p-8 bg-white rounded-3xl border border-outline-variant/10">
                     <p class="text-2xl font-display font-bold text-primary mb-1">24/7</p>
                     <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Node Monitoring</p>
                  </div>
                  <div class="p-8 bg-white rounded-3xl border border-outline-variant/10">
                     <p class="text-2xl font-display font-bold text-primary mb-1">Peer</p>
                     <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Reviewed Outcomes</p>
                  </div>
                  <div class="p-8 bg-white rounded-3xl border border-outline-variant/10">
                     <p class="text-2xl font-display font-bold text-primary mb-1">Public</p>
                     <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ledger Access</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </section>
  </div>
</template>
