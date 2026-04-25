<script setup lang="ts">
const frequency = ref<'once' | 'monthly'>('monthly')
const selectedTier = ref<number | 'custom'>(50)
const customAmount = ref<string>('')

const tiers = [10, 50, 100]

const activeAmount = computed(() => {
  if (selectedTier.value === 'custom') {
    const parsed = Number(customAmount.value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }
  return selectedTier.value
})

const formatted = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(activeAmount.value),
)

// Rough, motivating impact example — purely illustrative for the mockup.
const impactLine = computed(() => {
  const meals = Math.max(0, Math.round(activeAmount.value * 4))
  return `${meals.toLocaleString('en-US')} meals delivered`
})

function selectTier(tier: number | 'custom') {
  selectedTier.value = tier
  if (tier !== 'custom') customAmount.value = ''
}

const email = ref('')
const name = ref('')
const submitted = ref(false)

function handleSubmit() {
  // Mock — swap for real payment processor later.
  submitted.value = true
}
</script>

<template>
  <form
    class="mx-auto w-full max-w-2xl rounded-3xl border border-brand-100 bg-white p-8 shadow-xl shadow-brand-900/5 sm:p-10"
    @submit.prevent="handleSubmit"
  >
    <div v-if="!submitted">
      <!-- Frequency toggle -->
      <div class="mb-8">
        <p class="text-sm font-bold uppercase tracking-wider text-brand-600">
          Step 1 — Giving frequency
        </p>
        <div class="mt-3 grid grid-cols-2 rounded-full bg-brand-50 p-1">
          <button
            type="button"
            class="rounded-full px-6 py-3 text-sm font-bold transition"
            :class="
              frequency === 'once'
                ? 'bg-white text-brand-900 shadow'
                : 'text-brand-900/60 hover:text-brand-900'
            "
            @click="frequency = 'once'"
          >
            One-time
          </button>
          <button
            type="button"
            class="relative rounded-full px-6 py-3 text-sm font-bold transition"
            :class="
              frequency === 'monthly'
                ? 'bg-white text-brand-900 shadow'
                : 'text-brand-900/60 hover:text-brand-900'
            "
            @click="frequency = 'monthly'"
          >
            Monthly
            <span class="absolute -top-2 right-2 rounded-full bg-leaf-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              2× impact
            </span>
          </button>
        </div>
      </div>

      <!-- Tier buttons -->
      <div class="mb-8">
        <p class="text-sm font-bold uppercase tracking-wider text-brand-600">
          Step 2 — Choose an amount
        </p>
        <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            v-for="tier in tiers"
            :key="tier"
            type="button"
            class="rounded-2xl border-2 px-4 py-5 text-lg font-bold transition"
            :class="
              selectedTier === tier
                ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-md shadow-brand-600/10'
                : 'border-brand-100 text-brand-900/70 hover:border-brand-300 hover:text-brand-900'
            "
            @click="selectTier(tier)"
          >
            ${{ tier }}
          </button>
          <button
            type="button"
            class="rounded-2xl border-2 px-4 py-5 text-lg font-bold transition"
            :class="
              selectedTier === 'custom'
                ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-md shadow-brand-600/10'
                : 'border-brand-100 text-brand-900/70 hover:border-brand-300 hover:text-brand-900'
            "
            @click="selectTier('custom')"
          >
            Custom
          </button>
        </div>

        <div v-if="selectedTier === 'custom'" class="mt-4">
          <label for="custom-amount" class="sr-only">Custom amount</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-5 text-lg font-bold text-brand-900/60">$</span>
            <input
              id="custom-amount"
              v-model="customAmount"
              type="number"
              min="1"
              inputmode="decimal"
              placeholder="Enter amount"
              class="w-full rounded-2xl border-2 border-brand-200 bg-white py-4 pl-10 pr-5 text-lg font-bold text-brand-900 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
            />
          </div>
        </div>

        <!-- Impact preview -->
        <div
          v-if="activeAmount > 0"
          class="mt-5 flex items-center gap-3 rounded-2xl bg-leaf-50 p-4 text-sm"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-500 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p class="text-brand-900">
            Your gift of <span class="font-bold">{{ formatted }}{{ frequency === 'monthly' ? '/mo' : '' }}</span>
            provides approximately
            <span class="font-bold">{{ impactLine }}</span>.
          </p>
        </div>
      </div>

      <!-- Donor info -->
      <div class="mb-8 grid gap-4 sm:grid-cols-2">
        <div>
          <label for="donor-name" class="text-sm font-semibold text-brand-900">
            Full name
          </label>
          <input
            id="donor-name"
            v-model="name"
            type="text"
            required
            placeholder="Alex Rivera"
            class="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-900/40 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
          />
        </div>
        <div>
          <label for="donor-email" class="text-sm font-semibold text-brand-900">
            Email address
          </label>
          <input
            id="donor-email"
            v-model="email"
            type="email"
            required
            placeholder="alex@example.com"
            class="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm text-brand-900 placeholder:text-brand-900/40 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10"
          />
        </div>
      </div>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sunset-500 px-7 py-4 text-base font-bold text-white shadow-lg shadow-sunset-500/30 transition hover:-translate-y-0.5 hover:bg-sunset-600"
        :disabled="activeAmount <= 0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
          <path d="M11.645 20.91 12 21l.355-.09C17.79 19.2 22 15.05 22 9.75 22 6.57 19.43 4 16.25 4A5.24 5.24 0 0 0 12 6.09 5.24 5.24 0 0 0 7.75 4C4.57 4 2 6.57 2 9.75c0 5.3 4.21 9.45 9.645 11.16Z" />
        </svg>
        Give {{ formatted }}{{ frequency === 'monthly' ? ' / month' : '' }}
      </button>

      <p class="mt-4 text-center text-xs text-brand-900/60">
        Secure donation · 100% tax-deductible · Cancel monthly anytime.
      </p>
    </div>

    <!-- Success state -->
    <div v-else class="py-6 text-center">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 class="mt-6 text-2xl font-extrabold text-brand-900">Thank you, {{ name || 'friend' }}!</h3>
      <p class="mt-2 text-brand-900/70">
        Your {{ frequency === 'monthly' ? 'monthly' : 'one-time' }} gift of
        <span class="font-bold">{{ formatted }}</span> is on its way to the field.
        A receipt has been sent to <span class="font-semibold">{{ email || 'your inbox' }}</span>.
      </p>
    </div>
  </form>
</template>
