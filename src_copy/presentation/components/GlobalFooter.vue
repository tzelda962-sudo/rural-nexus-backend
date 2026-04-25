<template>
  <footer class="bg-primary-container text-white pt-16 pb-8 border-t-[8px] border-leaf relative overflow-hidden">
    <!-- Decorative Watermark Graphic -->
    <div class="absolute -bottom-24 -right-24 w-96 h-96 hex-mask bg-primary opacity-20 pointer-events-none"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <!-- Branding Col -->
        <div>
           <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 hex-mask bg-gradient-to-br from-cyan-400 to-leaf-400 flex items-center justify-center text-white font-bold text-sm">
              R
            </div>
            <span class="font-display font-bold text-lg text-white tracking-tight">RuralNexus</span>
          </div>
          <p class="text-sm text-white/90 leading-relaxed font-body">
            Empowering Rural Resilience. Action Research, Innovation, and Development for resilient food systems.
          </p>
        </div>

        <!-- Links Col -->
        <div>
          <h4 class="font-display font-semibold text-white mb-4">Quick Links</h4>
          <ul class="space-y-2 text-sm text-white/90">
            <li><NuxtLink to="/" class="hover:text-leaf transition-colors text-white/70">Home</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-leaf transition-colors text-white/70">Who We Are</NuxtLink></li>
            <li><NuxtLink to="/impact" class="hover:text-leaf transition-colors text-white/70">Impact Reports</NuxtLink></li>
            <li><NuxtLink to="/stories" class="hover:text-leaf transition-colors text-white/70">Field Dispatches</NuxtLink></li>
            <li><NuxtLink to="/research" class="hover:text-leaf transition-colors text-white/70">Methodology Repository</NuxtLink></li>
            <li><NuxtLink to="/gallery" class="hover:text-leaf transition-colors text-white/70">Gallery</NuxtLink></li>
            <li><NuxtLink to="/volunteer" class="hover:text-leaf transition-colors text-white/70">Volunteer</NuxtLink></li>
          </ul>
        </div>

        <!-- Contact Col -->
        <div>
          <h4 class="font-display font-semibold text-white mb-4">Contact Info</h4>
          <ul class="space-y-2 text-sm text-white/90">
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              +1 (555) 123-4567
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
              info@ruralnexus.org
            </li>
            <li class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              123 Innovation Drive, Agro Hub
            </li>
          </ul>
        </div>
      </div>
      
      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/70">
        <p>&copy; 2026 RuralNexus. All rights reserved.</p>
        <div class="flex gap-4 mt-4 md:mt-0">
          <button class="hover:text-leaf transition-colors">Accessibility Options</button>
        </div>
      </div>
    </div>
  </footer>
</template>
