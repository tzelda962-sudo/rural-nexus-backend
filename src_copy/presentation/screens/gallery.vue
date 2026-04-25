<script setup lang="ts">
useHead({ title: "Media Gallery — RuralNexus" });

const categories = [
  "All",
  "Field Work",
  "Community",
  "Research",
  "Events",
  "Partners",
];
const activeCategory = ref("All");

// Color-coded placeholder gallery items (no external images needed)
const galleryItems = [
  {
    id: "g1",
    title: "Smallholder farm trial, Western Kenya",
    category: "Field Work",
    location: "Kisumu, Kenya",
    year: "2025",
    gradient: "from-leaf-700 to-primary",
    aspect: "aspect-[4/3]",
    size: "col-span-2",
  },
  {
    id: "g2",
    title: "Soil sample collection, Andes plateau",
    category: "Research",
    location: "Cusco, Peru",
    year: "2025",
    gradient: "from-primary to-cyan",
    aspect: "aspect-[4/3]",
    size: "col-span-1",
  },
  {
    id: "g3",
    title: "Community water committee meeting",
    category: "Community",
    location: "Andavadoaka, Madagascar",
    year: "2024",
    gradient: "from-cyan to-leaf-500",
    aspect: "aspect-square",
    size: "col-span-1",
  },
  {
    id: "g4",
    title: "Rural Food Systems Summit 2025",
    category: "Events",
    location: "Geneva, Switzerland",
    year: "2025",
    gradient: "from-sunset to-primary-container",
    aspect: "aspect-[4/3]",
    size: "col-span-1",
  },
  {
    id: "g5",
    title: "Drone mapping session over Xingu basin",
    category: "Field Work",
    location: "Pará, Brazil",
    year: "2024",
    gradient: "from-leaf-600 to-leaf-400",
    aspect: "aspect-[4/3]",
    size: "col-span-2",
  },
  {
    id: "g6",
    title: "Partner signing ceremony with EU Agritech Fund",
    category: "Partners",
    location: "Brussels, Belgium",
    year: "2025",
    gradient: "from-primary-container to-leaf-700",
    aspect: "aspect-square",
    size: "col-span-1",
  },
  {
    id: "g7",
    title: "Irrigation system installation, Sindh",
    category: "Field Work",
    location: "Sindh, Pakistan",
    year: "2024",
    gradient: "from-cyan to-primary",
    aspect: "aspect-[4/3]",
    size: "col-span-1",
  },
  {
    id: "g8",
    title: "Volunteer orientation Q2 2025",
    category: "Events",
    location: "Online",
    year: "2025",
    gradient: "from-primary to-primary-container",
    aspect: "aspect-[4/3]",
    size: "col-span-1",
  },
  {
    id: "g9",
    title: "Women's agricultural co-op, Burkina Faso",
    category: "Community",
    location: "Ouagadougou, Burkina Faso",
    year: "2025",
    gradient: "from-sunset to-leaf-600",
    aspect: "aspect-[4/3]",
    size: "col-span-1",
  },
  {
    id: "g10",
    title: "Spectral analysis in the RuralNexus data lab",
    category: "Research",
    location: "Geneva, Switzerland",
    year: "2026",
    gradient: "from-leaf-700 to-cyan",
    aspect: "aspect-square",
    size: "col-span-1",
  },
  {
    id: "g11",
    title: "Tree planting day — Miombo woodland restoration",
    category: "Field Work",
    location: "Zambia",
    year: "2025",
    gradient: "from-leaf-500 to-primary",
    aspect: "aspect-[4/3]",
    size: "col-span-2",
  },
  {
    id: "g12",
    title: "Annual Partners Meeting, Nairobi 2025",
    category: "Events",
    location: "Nairobi, Kenya",
    year: "2025",
    gradient: "from-primary-container to-sunset",
    aspect: "aspect-[4/3]",
    size: "col-span-1",
  },
];

const filtered = computed(() =>
  activeCategory.value === "All"
    ? galleryItems
    : galleryItems.filter((g) => g.category === activeCategory.value),
);

const categoryColors: Record<string, string> = {
  "Field Work": "bg-leaf/10 text-leaf",
  Community: "bg-cyan/10 text-cyan",
  Research: "bg-primary/10 text-primary",
  Events: "bg-sunset/10 text-sunset",
  Partners: "bg-amber-500/10 text-amber-600",
};
</script>

<template>
  <div class="flex flex-col bg-surface">
    <!-- Hero -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-primary to-leaf-700 py-20 text-white"
    >
      <div
        class="hex-mask absolute -left-16 bottom-0 h-72 w-72 bg-white opacity-[0.04] pointer-events-none"
      />
      <div
        class="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"
      >
        <p class="text-sm font-bold uppercase tracking-widest opacity-70">
          Visual Archive
        </p>
        <h1 class="mt-4 font-display text-4xl font-bold md:text-5xl">
          Media & Gallery
        </h1>
        <p
          class="mx-auto mt-5 max-w-2xl font-body text-lg leading-relaxed opacity-85"
        >
          A visual record of the work — from field research to community
          convenings. Explore the people, places and moments that shape
          RuralNexus.
        </p>
      </div>
    </section>

    <!-- Filter bar -->
    <section
      class="sticky top-[72px] z-30 border-b border-outline-variant/10 bg-surface/90 py-4 backdrop-blur"
    >
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            v-for="cat in categories"
            :key="cat"
            type="button"
            class="flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="
              activeCategory === cat
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            "
            @click="activeCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </section>

    <!-- Masonry-ish grid -->
    <section class="py-16 bg-surface">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          <div
            v-for="item in filtered"
            :key="item.id"
            class="group relative cursor-pointer overflow-hidden rounded-2xl"
            :class="[item.aspect, item.size]"
          >
            <!-- Gradient placeholder (simulates an image) -->
            <div
              class="absolute inset-0 bg-gradient-to-br transition duration-500 group-hover:scale-105"
              :class="item.gradient"
            />
            <!-- Grid texture overlay -->
            <div
              class="absolute inset-0 opacity-10 mix-blend-overlay"
              style="
                background-image: radial-gradient(
                  circle at 30% 35%,
                  white 0,
                  transparent 50%
                );
              "
            />
            <!-- Hover overlay -->
            <div
              class="absolute inset-0 bg-black/0 transition group-hover:bg-black/40"
            />

            <!-- Category badge -->
            <div
              class="absolute left-4 top-4 z-10 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <span
                class="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                :class="categoryColors[item.category] ?? 'text-on-surface'"
              >
                {{ item.category }}
              </span>
            </div>

            <!-- Caption -->
            <div
              class="absolute inset-x-0 bottom-0 z-10 translate-y-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <p
                class="font-display text-sm font-semibold leading-snug text-white"
              >
                {{ item.title }}
              </p>
              <p class="mt-1 text-xs text-white/70">
                {{ item.location }} · {{ item.year }}
              </p>
            </div>
          </div>
        </div>

        <!-- Load more -->
        <div class="mt-12 flex justify-center">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-6 py-3 text-sm font-bold text-on-surface shadow-sm hover:border-primary hover:text-primary transition"
          >
            Load more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 5v14M5 12l7 7 7-7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>


  </div>
</template>
