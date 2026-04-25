<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header -->
    <section class="py-24 bg-surface-container-low text-on-surface relative overflow-hidden">
      <!-- Background Graphic -->
      <div class="absolute top-0 right-0 w-1/3 h-full hex-mask bg-primary opacity-5 -mr-24 -mt-12"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <p class="text-sm font-bold uppercase tracking-widest text-primary mb-4">Our Leadership</p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 leading-tight tracking-tight">
          Who We Are
        </h1>
        <p class="text-lg md:text-xl text-on-surface-variant max-w-3xl font-body leading-relaxed">
          RuralNexus is an international network of researchers, agronomists, and project managers dedicated to empowering rural resilience through evidence-based innovation.
        </p>
      </div>
    </section>

    <!-- Organigram Section -->
    <section class="py-24 bg-surface text-on-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="max-w-2xl">
            <h2 class="text-3xl lg:text-4xl font-display font-bold mb-4">Our International Team</h2>
            <p class="text-on-surface-variant font-body leading-relaxed">
              RuralNexus operates through a decentralized network of specialized program acquisition cells (PACs) and field technical hubs.
            </p>
          </div>
        </div>
        
        <!-- The New Explorer -->
        <div v-if="allMembers">
          <OrgExplorer :members="allMembers" />
        </div>
        <div v-else class="flex py-20 items-center justify-center text-on-surface-variant opacity-50 font-body">
          <p>Initializing organizational explorer...</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData } from '#imports';
import { MockTeamRepository } from '@infrastructure/repositories/MockTeamRepository';
import OrgExplorer from '../components/OrgExplorer.vue';

const teamRepo = new MockTeamRepository();
const { data: allMembers } = await useAsyncData('teamData', () => teamRepo.getOrganigram());
</script>
