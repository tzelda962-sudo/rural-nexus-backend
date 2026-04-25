<script setup lang="ts">
import { ChevronDown, ChevronRight, Users, Activity, MapPin, Search } from "lucide-vue-next";

// Simplified model for the NGO website
interface TeamMemberNode {
  id: string;
  name: string;
  role: string;
  category?: string; // e.g., "Directorate", "Field Ops"
  statusLabel?: string;
  statusColor?: 'active' | 'field' | 'research' | 'advisory';
  avatarUrl?: string;
  subordinateCount: number;
  isExpanded: boolean;
}

const props = defineProps<{
  node: TeamMemberNode;
  isSelected?: boolean;
  isLoadingChildren?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "toggle", id: string): void;
}>();

const statusColors: Record<string, string> = {
  active: "bg-leaf",
  field: "bg-cyan",
  research: "bg-primary",
  advisory: "bg-amber-500",
};

function onSelect() {
  emit("select", props.node.id);
}

function onToggle(e: Event) {
  e.stopPropagation();
  emit("toggle", props.node.id);
}

// Generate initials for avatar fallback
const initials = props.node.name
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);
</script>

<template>
  <div
    data-node-card
    :class="[
      'group relative w-64 bg-surface-container-lowest border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer select-none',
      isSelected
        ? 'border-primary ring-2 ring-primary/20 shadow-lg'
        : 'border-outline-variant/30 hover:border-primary/50 hover:shadow-md',
    ]"
    @click="onSelect"
  >
    <!-- Card Content -->
    <div class="p-4 flex items-start gap-3">
      <!-- Hex Avatar Mask -->
      <div class="relative shrink-0">
        <div class="w-12 h-12 hex-mask bg-surface-container-low flex items-center justify-center overflow-hidden border border-outline-variant/10">
          <img v-if="node.avatarUrl" :src="node.avatarUrl" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-gradient-to-br from-primary/10 to-leaf/10 flex items-center justify-center text-primary font-display font-bold text-sm">
            {{ initials }}
          </div>
        </div>
        <!-- Status Indicator -->
        <span
          :class="[
            'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-surface-container-lowest transition-transform group-hover:scale-110',
            statusColors[node.statusColor || 'active'],
          ]"
          :title="node.statusLabel"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h3 class="font-display font-bold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
          {{ node.name }}
        </h3>
        <p class="font-body text-[11px] text-on-surface-variant leading-tight truncate mt-0.5">
          {{ node.role }}
        </p>
        
        <!-- Category Pill -->
        <div class="flex items-center gap-1.5 mt-2">
          <span
            v-if="node.category"
            class="inline-block px-2 py-0.5 bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-wider rounded-md border border-primary/10"
          >
            {{ node.category }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions / Expansion -->
    <div
      v-if="node.subordinateCount > 0"
      class="flex items-center justify-between px-4 py-2 border-t border-outline-variant/10 bg-surface-container-low/50"
    >
      <span class="inline-flex items-center gap-1.5 text-[10px] font-medium text-on-surface-variant">
        <Users class="h-3 w-3 opacity-60" />
        {{ node.subordinateCount }} {{ node.subordinateCount === 1 ? 'member' : 'members' }}
      </span>
      
      <button
        type="button"
        class="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-container rounded-lg px-2 py-1 hover:bg-primary/5 transition-all"
        :disabled="isLoadingChildren"
        @click="onToggle"
      >
        <template v-if="isLoadingChildren">
          <svg class="animate-spin h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </template>
        <template v-else>
          <component
            :is="node.isExpanded ? ChevronDown : ChevronRight"
            class="h-3 w-3"
          />
          {{ node.isExpanded ? "Collapse" : "Explore" }}
        </template>
      </button>
    </div>
  </div>
</template>
