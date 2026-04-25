<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, ChevronRight, User, Users, MapPin, Briefcase, ArrowLeft } from 'lucide-vue-next';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
  avatarUrl?: string;
  bio?: string;
  expertise?: string[];
}

const props = defineProps<{
  members: TeamMember[];
}>();

const emit = defineEmits<{
  (e: 'select', member: TeamMember): void;
}>();

const focusedMemberId = ref<string | null>(null);
const searchQuery = ref('');
const showSearchResults = ref(false);

// Initialize with root
if (props.members.length > 0 && !focusedMemberId.value) {
  const root = props.members.find(m => m.parentId === null);
  if (root) focusedMemberId.value = root.id;
}

const focusedMember = computed(() => {
  return props.members.find(m => m.id === focusedMemberId.value) || null;
});

const directReports = computed(() => {
  if (!focusedMemberId.value) return [];
  return props.members.filter(m => m.parentId === focusedMemberId.value);
});

const breadcrumbs = computed(() => {
  if (!focusedMemberId.value) return [];
  const path: TeamMember[] = [];
  let current = focusedMember.value;
  
  while (current) {
    path.unshift(current);
    if (!current.parentId) break;
    current = props.members.find(m => m.id === current?.parentId) || null;
  }
  return path;
});

const searchResults = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return [];
  return props.members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.value.toLowerCase())
  ).slice(0, 5);
});

function selectMember(id: string) {
  focusedMemberId.value = id;
  searchQuery.value = '';
  showSearchResults.value = false;
  // Scroll to focus
  window.scrollTo({ top: document.getElementById('org-explorer')?.offsetTop || 0, behavior: 'smooth' });
}

function handleSearchFocus() {
  showSearchResults.value = true;
}

function goBack() {
  if (focusedMember.value?.parentId) {
    selectMember(focusedMember.value.parentId);
  }
}

// Helper for initials
function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
</script>

<template>
  <div id="org-explorer" class="flex flex-col gap-8 w-full max-w-6xl mx-auto">
    <!-- Header Utilities -->
    <div class="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 shadow-sm">
      <!-- Breadcrumbs -->
      <nav class="flex items-center flex-wrap gap-2 text-sm font-medium">
        <button 
          v-for="(crumb, index) in breadcrumbs" 
          :key="crumb.id"
          @click="selectMember(crumb.id)"
          class="flex items-center gap-2 transition-colors"
          :class="index === breadcrumbs.length - 1 ? 'text-primary' : 'text-on-surface-variant hover:text-primary'"
        >
          <span v-if="index > 0"><ChevronRight class="w-4 h-4 opacity-30" /></span>
          {{ crumb.name }}
        </button>
      </nav>

      <!-- Search Box -->
      <div class="relative w-full md:w-80 group">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search team members..."
          @focus="handleSearchFocus"
          class="block w-full pl-10 pr-3 py-2.5 bg-surface-container-highest border border-outline-variant/20 rounded-2xl text-sm placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        
        <!-- Search Dropdown -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div 
            v-if="showSearchResults && searchResults.length > 0" 
            class="absolute z-50 mt-2 w-full bg-surface-container-highest border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              v-for="member in searchResults"
              :key="member.id"
              @click="selectMember(member.id)"
              class="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-center gap-3 transition-colors border-b border-outline-variant/5 last:border-0"
            >
              <div class="w-8 h-8 hex-mask bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {{ getInitials(member.name) }}
              </div>
              <div>
                <p class="text-sm font-bold text-on-surface">{{ member.name }}</p>
                <p class="text-[10px] text-on-surface-variant uppercase tracking-wider">{{ member.role }}</p>
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Main Explorer View -->
    <div class="grid lg:grid-cols-12 gap-10">
      <!-- Sidebar / Details -->
      <div class="lg:col-span-5 flex flex-col gap-6">
        <Transition name="fade-slide" mode="out-in">
          <div :key="focusedMember?.id" v-if="focusedMember" class="bg-primary-container text-white rounded-[40px] p-8 md:p-10 relative overflow-hidden group shadow-2xl">
            <!-- Decorative Motif -->
            <div class="absolute -right-16 -bottom-16 w-64 h-64 hex-mask bg-leaf opacity-20 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-4 mb-8">
                <button 
                  v-if="focusedMember.parentId"
                  @click="goBack"
                  class="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  title="Go back up hierarchy"
                >
                  <ArrowLeft class="w-5 h-5" />
                </button>
                <div class="w-20 h-20 hex-mask border-2 border-white/20 p-1">
                  <div class="w-full h-full bg-white/10 hex-mask flex items-center justify-center text-2xl font-display font-bold">
                    {{ getInitials(focusedMember.name) }}
                  </div>
                </div>
              </div>

              <h2 class="text-3xl font-display font-bold mb-1 leading-tight">{{ focusedMember.name }}</h2>
              <p class="text-leaf-300 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">{{ focusedMember.role }}</p>
              
              <div class="space-y-6">
                <div>
                  <h4 class="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User class="w-3 h-3" /> Background
                  </h4>
                  <p class="text-white/90 leading-relaxed font-body text-sm md:text-base">
                    {{ focusedMember.bio || 'Rural resilience expert dedicated to cross-border innovation.' }}
                  </p>
                </div>
                
                <div v-if="focusedMember.expertise">
                  <h4 class="text-xs font-bold text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase class="w-3 h-3" /> Expertise
                  </h4>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="exp in focusedMember.expertise" 
                      :key="exp"
                      class="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-semibold border border-white/10"
                    >
                      {{ exp }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Content / Reports -->
      <div class="lg:col-span-7">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xl font-display font-bold text-on-surface">
            Direct Reports 
            <span class="text-sm font-normal text-on-surface-variant ml-2 opacity-60">({{ directReports.length }})</span>
          </h3>
          <div class="h-px flex-grow bg-outline-variant/10 mx-6 hidden md:block"></div>
        </div>

        <div v-if="directReports.length > 0" class="grid sm:grid-cols-2 gap-4">
          <button
            v-for="member in directReports"
            :key="member.id"
            @click="selectMember(member.id)"
            class="group bg-surface-container-low border border-outline-variant/20 rounded-3xl p-5 flex items-center gap-4 text-left hover:border-primary/40 hover:bg-primary/5 hover:shadow-xl transition-all duration-300"
          >
            <div class="w-14 h-14 hex-mask bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/10 group-hover:border-primary/20 transition-colors">
               <div v-if="member.avatarUrl" class="w-full h-full object-cover">
                 <img :src="member.avatarUrl" :alt="member.name" />
               </div>
               <span v-else class="text-sm font-bold text-on-surface/50">{{ getInitials(member.name) }}</span>
            </div>
            <div class="min-w-0">
              <h4 class="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                {{ member.name }}
              </h4>
              <p class="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider truncate mb-2 opacity-80">
                {{ member.role }}
              </p>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  EXPLORE <ChevronRight class="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>
        </div>
        
        <div v-else class="flex flex-col items-center justify-center py-20 bg-surface-container-low/50 rounded-[40px] border border-dashed border-outline-variant/20">
          <Users class="w-12 h-12 text-on-surface-variant opacity-20 mb-4" />
          <p class="text-on-surface-variant font-body text-sm opacity-60">No direct reports for this team member.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
