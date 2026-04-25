<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { ZoomIn, ZoomOut, Maximize, Hand } from "lucide-vue-next";

const props = defineProps<{
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
}>();

const containerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const scale = ref(props.initialScale || 1);
const translateX = ref(0);
const translateY = ref(0);

const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

// For double-tap zoom
let lastTapTime = 0;

const minScale = props.minScale || 0.1;
const maxScale = props.maxScale || 5;

// Pan logic
function startPan(e: MouseEvent | TouchEvent) {
  isDragging.value = true;
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  startX.value = clientX - translateX.value;
  startY.value = clientY - translateY.value;

  // Prevent default scroll behaviors
  if (e.cancelable) e.preventDefault();
}

function doPan(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  translateX.value = clientX - startX.value;
  translateY.value = clientY - startY.value;
}

function stopPan() {
  isDragging.value = false;
}

// Zoom logic centering on a point
function zoom(delta: number, centerX?: number, centerY?: number) {
  const oldScale = scale.value;
  const newScale = Math.min(
    Math.max(oldScale * (1 + delta), minScale),
    maxScale,
  );

  if (newScale === oldScale) return;

  // If no center provided, use container center
  if (centerX === undefined || centerY === undefined) {
    const rect = containerRef.value?.getBoundingClientRect();
    if (rect) {
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    } else {
      centerX = 0;
      centerY = 0;
    }
  }

  // Adjust translation to keep fixed point under cursor
  const rect = contentRef.value?.getBoundingClientRect();
  if (rect) {
    const dx = (centerX - rect.left) / oldScale;
    const dy = (centerY - rect.top) / oldScale;

    translateX.value -= dx * (newScale - oldScale);
    translateY.value -= dy * (newScale - oldScale);
  }

  scale.value = newScale;
}

function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = -e.deltaY * 0.001;
  zoom(delta, e.clientX, e.clientY);
}

// Double tap to zoom
function handleTap(e: MouseEvent | TouchEvent) {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTapTime;
  const clientX =
    "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const clientY =
    "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

  if (tapLength < 300 && tapLength > 0) {
    // Double tap detected
    if (scale.value > 1) {
      fitToScreen();
    } else {
      zoom(1.5, clientX, clientY);
    }
    e.preventDefault();
  }
  lastTapTime = currentTime;
}

function fitToScreen() {
  if (!containerRef.value || !contentRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const contentRect = contentRef.value.children[0].getBoundingClientRect();

  // Reset translation
  translateX.value = 0;
  translateY.value = 0;

  // Calculate best fit (with padding)
  const padding = 60;
  const scaleX =
    (containerRect.width - padding) / (contentRect.width / scale.value);
  const scaleY =
    (containerRect.height - padding) / (contentRect.height / scale.value);

  scale.value = Math.min(scaleX, scaleY, 1); // Don't upscale past 1

  // Center it
  setTimeout(() => {
    const newRect = contentRef.value?.getBoundingClientRect();
    if (newRect) {
      translateX.value = (containerRect.width - newRect.width) / 2;
      translateY.value = (containerRect.height - newRect.height) / 2;
    }
  }, 10);
}

defineExpose({ fitToScreen, zoom, translateX, translateY, scale });

onMounted(() => {
  window.addEventListener("mouseup", stopPan);
  window.addEventListener("touchend", stopPan);

  // Initial center/fit
  setTimeout(fitToScreen, 500);
});

onUnmounted(() => {
  window.removeEventListener("mouseup", stopPan);
  window.removeEventListener("touchend", stopPan);
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full h-full overflow-hidden bg-surface-container-low/50 rounded-3xl cursor-grab transition-colors"
    :class="{ 'cursor-grabbing bg-primary/5': isDragging }"
    @mousedown="startPan"
    @mousemove="doPan"
    @touchstart="startPan"
    @touchmove="doPan"
    @wheel="handleWheel"
    @click="handleTap"
  >
    <!-- The actual content being panned/zoomed -->
    <div
      ref="contentRef"
      class="absolute top-0 left-0 origin-top-left will-change-transform pointer-events-auto"
      :style="{
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }"
    >
      <slot />
    </div>

    <!-- UI Controls Overlay -->
    <div
      class="absolute bottom-6 right-6 flex flex-col gap-2 z-20 pointer-events-auto"
    >
      <div
        class="flex flex-col bg-surface-container-highest/80 backdrop-blur-md rounded-xl border border-outline-variant/20 p-1.5 shadow-xl"
      >
        <button
          @click.stop="zoom(0.2)"
          class="p-2.5 hover:bg-primary/20 rounded-lg text-primary transition-colors"
          title="Zoom In"
        >
          <ZoomIn class="w-5 h-5" />
        </button>
        <button
          @click.stop="zoom(-0.2)"
          class="p-2.5 hover:bg-primary/20 rounded-lg text-primary transition-colors"
          title="Zoom Out"
        >
          <ZoomOut class="w-5 h-5" />
        </button>
        <div class="h-px bg-outline-variant/10 mx-2 my-1"></div>
        <button
          @click.stop="fitToScreen"
          class="p-2.5 hover:bg-primary/20 rounded-lg text-primary transition-colors"
          title="Reset View"
        >
          <Maximize class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Info Pill -->
      <div
        class="flex items-center gap-2 px-3 py-1.5 bg-surface-container-highest/60 backdrop-blur-md rounded-full border border-outline-variant/10 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest shadow-lg"
      >
        <Hand class="w-3 h-3 opacity-50" />
        Drag to Pan • {{ Math.round(scale * 100) }}%
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure the content container doesn't block events if empty space */
[ref="contentRef"] {
  min-width: 100%;
  min-height: 100%;
}

/* User cannot select text while dragging to prevent messy UI */
.cursor-grabbing * {
  user-select: none !important;
}
</style>
