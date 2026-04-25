<script setup lang="ts">
// Recursive component to render the organigram tree
import OrgNodeCard from "./OrgNodeCard.vue";

interface TeamMemberNode {
  id: string;
  name: string;
  role: string;
  category?: string;
  statusLabel?: string;
  statusColor?: 'active' | 'field' | 'research' | 'advisory';
  avatarUrl?: string;
  subordinateCount: number;
  isExpanded: boolean;
  depth: number;
}

const props = defineProps<{
  node: TeamMemberNode;
  children: TeamMemberNode[];
  childrenOf: (id: string) => TeamMemberNode[];
  selectedId: string | null;
  loadingDepth: (depth: number) => boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "toggle", id: string): void;
}>();

function onSelect(id: string) {
  emit("select", id);
}
function onToggle(id: string) {
  emit("toggle", id);
}
</script>

<template>
  <div class="org-tree-node">
    <!-- The node itself -->
    <div class="flex justify-center transition-all duration-500 ease-in-out">
      <OrgNodeCard
        :node="node"
        :is-selected="selectedId === node.id"
        :is-loading-children="node.isExpanded && loadingDepth(node.depth + 1)"
        @select="onSelect"
        @toggle="onToggle"
      />
    </div>

    <!-- Children -->
    <Transition
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-4 scale-95"
    >
      <div
        v-if="node.isExpanded && children.length > 0"
        class="org-tree-children"
      >
        <div
          v-for="child in children"
          :key="child.id"
          class="org-tree-child"
        >
          <OrgChartTree
            :node="child"
            :children="childrenOf(child.id)"
            :children-of="childrenOf"
            :selected-id="selectedId"
            :loading-depth="loadingDepth"
            @select="onSelect"
            @toggle="onToggle"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.org-tree-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
}

/* Container for all children of a node */
.org-tree-children {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  padding-top: 40px;
  margin-top: 8px;
}

/* Vertical line from parent down to the horizontal connector */
.org-tree-children::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 24px;
  background-color: #e5e7eb; /* Gray-200 */
  transform: translateX(-50%);
}

/* Each direct child */
.org-tree-child {
  position: relative;
  padding-top: 24px;
}

/* Vertical line from the horizontal connector down to each child */
.org-tree-child::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 24px;
  background-color: #e5e7eb;
  transform: translateX(-50%);
}

/* Horizontal connector across all children */
.org-tree-child::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e5e7eb;
}

/* Hide the outer half of the horizontal line on the first child */
.org-tree-child:first-child::after {
  left: 50%;
}

/* Hide the outer half of the horizontal line on the last child */
.org-tree-child:last-child::after {
  right: 50%;
}

/* Only one child → just the vertical line, no horizontal */
.org-tree-child:only-child::after {
  display: none;
}
</style>
