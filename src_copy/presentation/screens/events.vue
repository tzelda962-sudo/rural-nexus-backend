<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Droplets, 
  Sprout, 
  ShieldAlert, 
  BookOpen, 
  Tractor, 
  Heart, 
  ArrowRight,
  FileText,
  Download,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-vue-next';

useHead({ title: 'Action Hub — RuralNexus' });

const activeTab = ref('projects');

const tabs = [
  { id: 'projects', label: 'Active Projects', icon: Sprout },
  { id: 'publications', label: 'Publications', icon: FileText },
  { id: 'news', label: 'News & Events', icon: Calendar },
];

// Migrated from old programs.vue
const projectItems = [
  {
    id: 'p1',
    title: 'Water Governance & Sovereignty',
    description: 'Implementing decentralized, solar-powered filtration systems and community-led watershed management protocols in arid innovation zones.',
    stat: '312 systems',
    statLabel: 'Deployed Innovation Nodes',
    icon: Droplets,
    color: 'emerald',
    location: 'Turkana, Kenya',
    status: 'In Progress'
  },
  {
    id: 'p2',
    title: 'Regenerative Agro-Systems',
    description: 'Advancing native-species reforestation and soil health monitoring through satellite data integration and local knowledge mapping.',
    stat: '1.2M nodes',
    statLabel: 'Active Reforestation Points',
    icon: Sprout,
    color: 'leaf',
    location: 'Amazon Basin, Brazil',
    status: 'Scaling'
  },
  {
    id: 'p3',
    title: 'Climate Resilience Hubs',
    description: 'Establishing rapid-response field stations and climate-adaptive infrastructure for vulnerable agrarian communities across the Global South.',
    stat: '48 hubs',
    statLabel: 'Active Regional Stations',
    icon: ShieldAlert,
    color: 'amber',
    location: 'Sundarbans, India',
    status: 'Active'
  },
  {
    id: 'p4',
    title: 'Action Research Education',
    description: 'Scaling field-based learning modules and scholarships for the next generation of rural development leaders and agronomists.',
    stat: '9,400 leaders',
    statLabel: 'Empowered Research Fellows',
    icon: BookOpen,
    color: 'cyan',
    location: 'Global Connectivity',
    status: 'Enrolling'
  },
  {
    id: 'p5',
    title: 'Sustainable Food Nexuses',
    description: 'Developing drought-resistant seed registries and circular economy grain banks co-managed with regional cooperatives.',
    stat: '22,000 cooperatives',
    statLabel: 'Networked Field Partners',
    icon: Tractor,
    color: 'primary',
    location: 'Sindh, Pakistan',
    status: 'Field Testing'
  },
  {
    id: 'p6',
    title: 'Biosocial Health Integration',
    description: 'Merging clinical rural health services with nutritional security data to improve community resilience metrics.',
    stat: '14 hubs',
    statLabel: 'Integrated Health Stations',
    icon: Heart,
    color: 'leaf-dark',
    location: 'Oaxaca, Mexico',
    status: 'Pilot'
  }
];

const publications = [
  {
    id: 'pub1',
    title: 'Impact Report 2026: The Transdisciplinary Gap',
    author: 'RuralNexus PAC3 Team',
    category: 'Annual Report',
    date: 'March 2026',
    summary: 'A deep dive into the socio-technical barriers preventing rural innovation from scaling across disparate geopolitical regions.'
  },
  {
    id: 'pub2',
    title: 'Drought Resilience in Smallholder Systems',
    author: 'Dr. Sarah K. et al.',
    category: 'Policy Brief',
    date: 'February 2026',
    summary: 'Evidence-based recommendations for integrating decentralized greywater systems into regional irrigation policy.'
  },
  {
    id: 'pub3',
    title: 'Action Research: Methodological Sovereignty',
    author: 'RuralNexus PAC4 Education',
    category: 'Research Paper',
    date: 'January 2026',
    summary: 'A proposed framework for honouring local farming knowledge within high-precision satellite monitoring protocols.'
  }
];

const upcomingEvents = [
  {
    id: 'e1',
    title: 'Rural Food Systems Innovation Summit 2026',
    type: 'Conference',
    date: 'June 12–14, 2026',
    location: 'Geneva, Switzerland',
    description: 'A flagship summit bringing together agronomists and policy-makers to share climate-resilient models.',
    spotsLeft: 41,
    gradient: 'from-primary to-leaf-600',
  },
  {
    id: 'e2',
    title: 'Webinar: Measuring Impact in Participatory Research',
    type: 'Webinar',
    date: 'May 8, 2026',
    location: 'Online',
    description: 'Exploring how to design M&E frameworks that honour community participation.',
    spotsLeft: 210,
    gradient: 'from-cyan to-leaf-500',
  }
];

const typeColors: Record<string, string> = {
  Conference: 'bg-primary/10 text-primary',
  Webinar: 'bg-cyan/10 text-cyan',
  'Field Visit': 'bg-leaf/10 text-leaf',
  Projects: 'bg-primary/5 text-primary'
};
</script>

<template>
  <div class="flex flex-col bg-surface min-h-screen">
    <!-- Hero -->
    <section class="relative overflow-hidden bg-primary py-24 text-white">
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute -right-24 -top-24 w-96 h-96 hex-mask bg-white"></div>
        <div class="absolute left-10 bottom-10 w-80 h-80 hex-mask border-2 border-white/20"></div>
      </div>
      
      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-leaf-300 mb-6">Development Hub</p>
          <h1 class="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
            The <span class="text-leaf-300 italic">Action Hub</span>
          </h1>
          <p class="font-body text-lg md:text-xl text-white/80 leading-relaxed balance">
            A comprehensive repository for RuralNexus projects, research publications, and international gatherings designed to drive food system transformation.
          </p>
        </div>
      </div>
    </section>

    <!-- Sub-navigation Tabs -->
    <section class="sticky top-[72px] z-40 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-8 py-4 overflow-x-auto no-scrollbar">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-bold text-sm tracking-widest uppercase whitespace-nowrap"
            :class="activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-on-surface-variant hover:bg-surface-container-low'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="flex-grow py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- MODULE: Projects -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="activeTab === 'projects'" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <article 
              v-for="proj in projectItems" 
              :key="proj.id"
              class="group bg-surface-container-lowest p-8 rounded-[40px] shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <div class="flex items-center justify-between mb-8">
                <div class="w-14 h-14 hex-mask bg-primary/5 group-hover:bg-primary transition-colors flex items-center justify-center text-primary group-hover:text-white">
                   <component :is="proj.icon" class="w-6 h-6" />
                </div>
                <span class="text-[10px] font-bold px-3 py-1 bg-surface-container-low rounded-full uppercase tracking-widest text-on-surface-variant">
                  {{ proj.status }}
                </span>
              </div>
              <h3 class="text-lg font-display font-bold text-on-surface mb-3">{{ proj.title }}</h3>
              <p class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-8">{{ proj.description }}</p>
              
              <div class="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant mb-6 opacity-50 uppercase tracking-widest">
                <MapPin class="w-3 h-3" /> {{ proj.location }}
              </div>

              <div class="border-t border-outline-variant/10 pt-6">
                <p class="text-xl font-display font-bold text-primary mb-0.5">{{ proj.stat }}</p>
                <p class="text-[11px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest">{{ proj.statLabel }}</p>
              </div>
            </article>
          </div>
        </Transition>

        <!-- MODULE: Publications -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="activeTab === 'publications'" class="grid grid-cols-1 gap-6">
            <div 
              v-for="pub in publications" 
              :key="pub.id"
              class="p-8 bg-surface-container-lowest rounded-[32px] border border-outline-variant/10 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center justify-between gap-8 group"
            >
              <div class="flex items-center gap-8">
                 <div class="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant/40 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                   <FileText class="w-8 h-8" />
                 </div>
                 <div>
                   <span class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 block">{{ pub.category }}</span>
                   <h3 class="text-xl font-display font-bold text-on-surface mb-2 tracking-tight">{{ pub.title }}</h3>
                   <p class="text-sm text-on-surface-variant font-body opacity-70 mb-1 leading-relaxed">{{ pub.summary }}</p>
                   <p class="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest">{{ pub.author }} • {{ pub.date }}</p>
                 </div>
              </div>
              <button class="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                <Download class="w-4 h-4" /> PDF Access
              </button>
            </div>
          </div>
        </Transition>

        <!-- MODULE: News & Events -->
        <Transition
          enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-if="activeTab === 'news'" class="grid md:grid-cols-2 gap-8">
             <article
              v-for="event in upcomingEvents"
              :key="event.id"
              class="flex flex-col bg-surface-container-lowest rounded-[44px] overflow-hidden group hover:shadow-2xl transition-all duration-500"
            >
              <div class="p-10 flex-grow">
                <div class="flex justify-between items-start mb-10">
                  <span class="rounded-full bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                    {{ event.type }}
                  </span>
                  <div class="flex items-center gap-2 text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                    <Calendar class="w-3.5 h-3.5" /> {{ event.date }}
                  </div>
                </div>
                <h3 class="text-2xl font-display font-bold text-on-surface mb-4 leading-snug group-hover:text-primary transition-colors">{{ event.title }}</h3>
                <p class="text-sm font-body text-on-surface-variant leading-relaxed opacity-70 mb-10">{{ event.description }}</p>
                
                <div class="flex items-center justify-between mt-auto pt-8 border-t border-outline-variant/10">
                  <div class="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                    <MapPin class="w-4 h-4 text-primary/40" /> {{ event.location }}
                  </div>
                  <button class="flex items-center gap-3 text-xs font-bold text-primary uppercase tracking-widest group/btn">
                    Register Now <ArrowRight class="w-4 h-4 transition-transform group-btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </Transition>

      </div>
    </main>

    <!-- Global CTA -->
    <section class="bg-surface-container-low py-24">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h2 class="font-display text-3xl font-bold mb-6 tracking-tight">Catalysing Change Through Collaboration</h2>
        <p class="text-lg text-on-surface-variant font-body opacity-70 mb-10 leading-relaxed">
          We welcome proposals for co-hosting events, contributing to research publications, or partnering on field implementation projects.
        </p>
        <NuxtLink to="/contact" class="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary rounded-[22px] font-bold shadow-xl hover:shadow-2xl transition-all">
          Initiate Contact <ExternalLink class="w-4 h-4" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hex-mask {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.balance {
  text-wrap: balance;
}
</style>

