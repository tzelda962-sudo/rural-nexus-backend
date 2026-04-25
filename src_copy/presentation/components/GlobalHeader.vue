<script setup lang="ts">
import { ref } from 'vue';
import { 
  Menu, X, Search, ChevronRight, ChevronDown, 
  Layers, Rocket, Info, BarChart3, MessageSquareQuote, BookOpen 
} from 'lucide-vue-next';

const isMenuOpen = ref(false);
const isDropdownOpen = ref<string | null>(null);

const navLinks = [
  { name: 'Home', path: '/' },
  { 
    name: 'Who We Are', 
    path: '#',
    children: [
      { name: 'Overview', path: '/about', desc: 'Our mission & vision', icon: Info },
      { name: 'Impact Metrics', path: '/impact', desc: 'Measurable outcomes', icon: BarChart3 },
      { name: 'Field Stories', path: '/stories', desc: 'Voices from the ground', icon: MessageSquareQuote }
    ]
  },
  { 
    name: 'What We Do', 
    path: '#',
    children: [
      { name: 'Our Programs', path: '/programs', desc: 'Core strategic pillars', icon: Layers },
      { name: 'Action Hub', path: '/events', desc: 'Projects & Publications', icon: Rocket },
      { name: 'Research & Tools', path: '/research', desc: 'Methodological resources', icon: BookOpen }
    ]
  },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Volunteer', path: '/volunteer' },
];

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
  }
}

function closeMenu() {
  isMenuOpen.value = false;
  isDropdownOpen.value = null;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}
</script>

<template>
  <header class="sticky top-0 z-50 glass-nav border-b no-border shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-20 items-center">
        <!-- Logo -->
        <div class="flex-shrink-0 flex items-center relative z-50">
          <NuxtLink to="/" @click="closeMenu" class="flex items-center gap-2 group">
            <div class="w-10 h-10 hex-mask bg-gradient-to-br from-cyan-500 to-leaf-500 flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105">
              R
            </div>
            <span class="font-display font-bold text-xl text-primary-container tracking-tight">RuralNexus</span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex space-x-4 items-center">
          <template v-for="link in navLinks" :key="link.name">
            <!-- Simple Link -->
            <NuxtLink 
              v-if="!link.children"
              :to="link.path"
              class="text-on-surface/80 hover:text-primary px-3 py-2 text-sm font-bold tracking-widest uppercase transition-colors"
              active-class="text-primary"
            >
              {{ link.name }}
            </NuxtLink>

            <!-- Dropdown -->
            <div 
              v-else 
              class="relative group/dropdown"
              @mouseenter="isDropdownOpen = link.name"
              @mouseleave="isDropdownOpen = null"
            >
              <button 
                class="flex items-center gap-1.5 text-on-surface/80 hover:text-primary px-3 py-2 text-sm font-bold tracking-widest uppercase transition-all"
                :class="{ 'text-primary': isDropdownOpen === link.name }"
              >
                {{ link.name }}
                <ChevronDown class="w-4 h-4 transition-transform duration-300" :class="{ 'rotate-180': isDropdownOpen === link.name }" />
              </button>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
              >
                <div 
                  v-show="isDropdownOpen === link.name"
                  class="absolute top-full left-1/2 -translate-x-1/2 w-64 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-outline-variant/10 p-2 overflow-hidden"
                >
                  <NuxtLink 
                    v-for="child in link.children"
                    :key="child.path"
                    :to="child.path"
                    @click="closeMenu"
                    class="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 group/item transition-all"
                  >
                    <div class="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/item:scale-110 transition-transform">
                      <component :is="child.icon" class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="text-sm font-bold text-on-surface">{{ child.name }}</p>
                      <p class="text-[10px] text-on-surface-variant opacity-60 font-medium">{{ child.desc }}</p>
                    </div>
                  </NuxtLink>
                </div>
              </Transition>
            </div>
          </template>
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center relative z-50">
          <button class="p-2 text-on-surface-variant hover:text-primary transition-colors hidden md:block">
            <Search class="w-5 h-5" />
          </button>
          
          <div class="ml-4 hidden sm:block">
            <NuxtLink to="/contact" @click="closeMenu" class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold uppercase tracking-widest rounded-xl text-white bg-primary hover:bg-primary-container shadow-xl shadow-primary/20 transition-all">
              Contact Us
            </NuxtLink>
          </div>

          <button 
            @click="toggleMenu"
            class="lg:hidden ml-4 p-2 text-on-surface hover:text-primary transition-colors rounded-lg bg-surface-container-low"
          >
            <component :is="isMenuOpen ? X : Menu" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
      >
        <div v-if="isMenuOpen" @click="closeMenu" class="fixed inset-0 bg-primary/40 backdrop-blur-md z-[90]"></div>
      </Transition>

      <Transition
        enter-active-class="transition duration-500 ease-in-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition duration-400 ease-in-out"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div v-if="isMenuOpen" class="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[100] border-l border-outline-variant/10 flex flex-col h-[100dvh]">
          <div class="h-20 flex items-center justify-between px-6 shrink-0 border-b border-outline-variant/5">
             <NuxtLink to="/" @click="closeMenu" class="flex items-center gap-2 group">
                <div class="w-8 h-8 hex-mask bg-gradient-to-br from-cyan-500 to-leaf-500 flex items-center justify-center text-white font-bold text-lg">R</div>
                <span class="font-display font-bold text-lg text-primary-container tracking-tight">RuralNexus</span>
             </NuxtLink>
             <button @click="toggleMenu" class="p-2 text-on-surface hover:bg-surface-container-low rounded-xl">
               <X class="w-6 h-6" />
             </button>
          </div>

          <div class="flex-grow overflow-y-auto px-6 py-8 flex flex-col gap-6">
            <nav class="flex flex-col gap-1">
              <template v-for="link in navLinks" :key="link.name">
                <!-- Mobile Simple Link -->
                <NuxtLink 
                  v-if="!link.children"
                  :to="link.path"
                  @click="closeMenu"
                  class="flex items-center justify-between px-6 py-4 rounded-2xl text-lg font-display font-bold text-on-surface hover:bg-primary/5 hover:text-primary transition-all"
                  active-class="bg-primary/5 text-primary"
                >
                  {{ link.name }}
                  <ChevronRight class="w-5 h-5 opacity-40" />
                </NuxtLink>

                <!-- Mobile Dropdown Links -->
                <div v-else class="flex flex-col">
                   <p class="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">{{ link.name }}</p>
                   <NuxtLink 
                    v-for="child in link.children"
                    :key="child.path"
                    :to="child.path"
                    @click="closeMenu"
                    class="flex items-center gap-5 px-8 py-4 rounded-2xl hover:bg-primary/5 transition-all group"
                  >
                    <div class="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <component :is="child.icon" class="w-5 h-5" />
                    </div>
                    <div>
                      <p class="text-base font-display font-bold text-on-surface">{{ child.name }}</p>
                      <p class="text-xs text-on-surface-variant opacity-60">{{ child.desc }}</p>
                    </div>
                  </NuxtLink>
                </div>
              </template>
            </nav>

            <div class="mt-auto pb-6 pt-12 border-t border-outline-variant/10">
              <NuxtLink to="/contact" @click="closeMenu" class="flex items-center justify-center w-full py-5 bg-primary text-white rounded-[22px] font-bold shadow-2xl shadow-primary/30">
                Contact Our Team
              </NuxtLink>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.glass-nav {
  background: rgba(248, 250, 248, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.no-border {
  border-bottom: none !important;
}

@supports (height: 100dvh) {
  .h-\[100dvh\] {
    height: 100dvh;
  }
}
</style>
