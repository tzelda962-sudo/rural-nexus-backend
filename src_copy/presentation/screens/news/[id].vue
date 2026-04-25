<template>
  <div v-if="pending" class="min-h-screen flex items-center justify-center bg-surface">
    <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
  
  <div v-else-if="error || !data" class="min-h-screen flex items-center justify-center bg-surface text-center px-4">
    <div>
      <h1 class="text-4xl font-display font-bold mb-4">Article Not Found</h1>
      <p class="text-on-surface-variant font-body mb-8">The requested academic article or news event could not be located.</p>
      <NuxtLink to="/" class="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors">Return Home</NuxtLink>
    </div>
  </div>

  <article v-else class="bg-surface text-on-surface pb-24">
    <!-- Hero Image Area -->
    <div class="relative w-full h-[50vh] min-h-[400px] bg-primary-container">
      <img v-if="data.event.imageUrl" :src="data.event.imageUrl" :alt="data.event.title" class="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
      <div v-else class="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-navy opacity-80"></div>
      
      <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
      
      <div class="absolute bottom-0 left-0 w-full">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <span class="inline-block px-3 py-1 bg-amber text-on-tertiary-container text-xs font-bold uppercase tracking-wide rounded-full mb-4 shadow-sm">
            {{ data.event.category }}
          </span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-4 drop-shadow-md">
            {{ data.event.title }}
          </h1>
          <div class="flex items-center gap-4 text-white/80 font-body text-sm font-medium">
            <span>Posted: {{ data.event.date }}</span>
            <span v-if="data.event.isHighlight" class="flex items-center gap-1 text-leaf">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Featured Insight
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <!-- Article Content -->
      <div class="prose prose-lg prose-headings:font-display prose-headings:font-bold prose-a:text-cyan prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl max-w-none text-on-surface-variant font-body" v-html="data.event.contentHTML || `<p>${data.event.summary}</p>`"></div>
      
      <!-- Back / Share actions -->
      <div class="mt-16 pt-8 border-t border-outline-variant flex justify-between items-center">
        <NuxtLink to="/" class="text-primary font-bold hover:text-primary-container flex items-center gap-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Overview
        </NuxtLink>
        
        <div class="flex gap-4">
          <button class="p-2 bg-surface-container-low rounded-full hover:bg-surface-container-highest transition-colors text-on-surface">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Related Articles -->
    <div v-if="data.related.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
      <h3 class="text-2xl font-display font-bold mb-8">Related in {{ data.event.category }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <NuxtLink 
          v-for="rel in data.related" 
          :key="rel.id" 
          :to="`/news/${rel.id}`"
          class="block p-6 bg-surface-container-low rounded-xl hover:-translate-y-1 hover:bg-surface-container-highest transition-all duration-300 group"
        >
          <p class="text-xs font-bold text-primary mb-2">{{ rel.date }}</p>
          <h4 class="font-display font-bold text-lg mb-2 group-hover:text-primary-container transition-colors">{{ rel.title }}</h4>
          <p class="text-sm font-body text-on-surface-variant line-clamp-3">{{ rel.summary }}</p>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import useNewsDetail from '../../composables/useNewsDetail';

const route = useRoute();
const { data, pending, error } = await useNewsDetail(route.params.id as string);
</script>
