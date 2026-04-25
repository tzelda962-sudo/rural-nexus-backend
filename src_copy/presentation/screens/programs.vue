<script setup lang="ts">
import { useAsyncData } from '#imports';
import { GetHomeDataUseCase } from '@application/use_cases/GetHomeDataUseCase';
import { MockProgramAreaRepository } from '@infrastructure/repositories/MockProgramAreaRepository';
import { MockNewsEventRepository } from '@infrastructure/repositories/MockNewsEventRepository';
import { MockTeamRepository } from '@infrastructure/repositories/MockTeamRepository';
import { Check, ArrowRight, Target, Globe, Zap, Layers } from 'lucide-vue-next';

useHead({ title: 'Our Programs: Structural Glue — RuralNexus' });

const useCase = new GetHomeDataUseCase(
  new MockProgramAreaRepository(),
  new MockNewsEventRepository(),
  new MockTeamRepository()
);

const { data: homeData } = await useAsyncData('programsPillars', () => useCase.execute());

function getColorClass(theme: string) {
  const map: Record<string, string> = {
    cyan: 'bg-cyan',
    primary: 'bg-primary-container',
    navy: 'bg-primary',
    amber: 'bg-amber',
    leaf: 'bg-leaf',
  };
  return map[theme] || 'bg-primary-container';
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-surface">
    <!-- Restored & Refined Header -->
    <header class="relative pt-32 pb-48 overflow-hidden bg-primary text-white">
      <!-- Organic Motifs -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute right-48 top-48 w-64 h-64 hex-mask bg-leaf"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6 flex items-center gap-3">
             Our Structural Methodology
          </p>
          <h1 class="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-[1.1] tracking-tight">
            Our <span class="text-leaf-300 italic">Programs.</span>
          </h1>
          <p class="text-lg md:text-xl font-body text-white/80 leading-relaxed balance py-4">
            RuralNexus operates through strategic program areas that provide the structural glue needed for multi-stakeholder and transdisciplinary innovation.
          </p>
          
          <div class="flex flex-wrap gap-8 mt-12 pt-12 border-t border-white/10">
             <div class="flex items-center gap-3">
               <Layers class="w-5 h-5 text-leaf-300" />
               <span class="text-sm font-bold tracking-widest uppercase">Pillar Based Action</span>
             </div>
             <div class="flex items-center gap-3">
               <Globe class="w-5 h-5 text-leaf-300" />
               <span class="text-sm font-bold tracking-widest uppercase">Transdisciplinary Scope</span>
             </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Program Areas Grid -->
    <section class="relative -mt-32 pb-24 z-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div 
            v-for="area in homeData?.programAreas" 
            :key="area.id"
            class="flex flex-col md:flex-row gap-8 bg-surface-container-lowest p-10 rounded-[50px] shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 group"
          >
            <!-- Hexagonal Icon / Code -->
            <div class="flex-shrink-0">
                <div 
                  class="w-24 h-24 hex-mask text-white flex items-center justify-center font-display font-bold text-3xl shadow-2xl transition-transform duration-500 group-hover:scale-110"
                  :class="getColorClass(area.colorTheme)"
                >
                  {{ area.code }}
                </div>
            </div>

            <div class="flex-grow">
              <h3 class="text-2xl font-display font-bold mb-6 group-hover:text-primary transition-colors">{{ area.title }}</h3>
              <p class="text-on-surface-variant font-body leading-relaxed mb-10 opacity-80 text-sm">
                {{ area.description }}
              </p>
              
              <!-- SDG Mapping (Vibrant Badges) -->
              <div class="mb-10">
                <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-50">Strategic Alignment (SDGs)</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="sdg in area.sdgs" 
                    :key="sdg.code"
                    class="px-4 py-1.5 text-[10px] font-bold text-white rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-transform"
                    :style="{ backgroundColor: sdg.color }"
                  >
                    Goal {{ sdg.code }}
                  </span>
                </div>
              </div>

              <!-- Core Initiatives -->
              <div class="mb-10 p-8 bg-surface-container-low rounded-[32px] border border-outline-variant/10 group-hover:border-primary/20 transition-colors">
                 <p class="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-8 opacity-50">Active Field Initiatives</p>
                 <ul class="space-y-6">
                   <li v-for="init in area.initiatives" :key="init.title" class="flex gap-4 items-start">
                     <div class="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                       <Check class="w-3.5 h-3.5" />
                     </div>
                     <div>
                       <strong class="font-display text-sm text-on-surface block mb-1.5">{{ init.title }}</strong>
                       <span class="text-xs text-on-surface-variant font-body opacity-70 leading-relaxed block">{{ init.desc }}</span>
                     </div>
                   </li>
                 </ul>
              </div>

              <NuxtLink to="/contact" class="inline-flex items-center gap-3 text-primary font-bold text-xs tracking-[0.2em] uppercase hover:text-primary-container transition-all group/link">
                Inquire about collaboration
                <ArrowRight class="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Ecosystem -->
    <section class="py-24 bg-surface-container-low relative overflow-hidden">
       <div class="absolute left-0 top-0 w-64 h-64 hex-mask bg-primary opacity-5 -ml-32 -mt-32 animate-pulse"></div>
       
       <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
         <h2 class="text-3xl md:text-4xl font-display font-bold text-on-surface mb-6 tracking-tight">
           Join the RuralNexus Ecosystem
         </h2>
         <p class="text-lg text-on-surface-variant font-body mb-12 max-w-2xl mx-auto opacity-80 leading-relaxed">
           Our programs scale through collaborative intelligence. We are seeking academic partners, field organizations, and technology hub collaborators.
         </p>
         <div class="flex flex-wrap justify-center gap-6">
           <button class="px-10 py-5 bg-primary text-white rounded-[22px] font-bold hover:shadow-2xl hover:shadow-primary/30 transition-all">
             Research Partnership
           </button>
           <button class="px-10 py-5 bg-surface-container-highest text-on-surface rounded-[22px] font-bold hover:bg-surface-container-high transition-all">
             Regional Collaboration
           </button>
         </div>
       </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.balance {
  text-wrap: balance;
}
</style>
