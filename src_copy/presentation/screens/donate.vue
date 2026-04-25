<script setup lang="ts">
useHead({
  title: 'Donate — Horizon Aid',
})
</script>

<template>
  <div class="relative isolate overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-white py-16 sm:py-24">
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 -z-10 h-80 opacity-60"
      style="background-image: radial-gradient(circle at 50% 0, rgba(53,121,246,0.18) 0, transparent 50%);"
    />

    <div class="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
      <p class="text-sm font-bold uppercase tracking-wider text-brand-600">
        Make your gift
      </p>
      <h1 class="mt-3 text-4xl font-extrabold tracking-tight text-brand-900 sm:text-5xl">
        Change a life today.
      </h1>
      <p class="mt-5 text-lg leading-relaxed text-brand-900/70">
        100% of your donation funds our humanitarian and environmental programs.
        Operating costs are covered by a separate board-funded endowment — so
        every dollar you give goes straight to the field.
      </p>
    </div>

    <div class="mt-12 px-4 sm:px-6 lg:px-8">
      <DonationForm />
    </div>

    <!-- Trust row -->
    <div class="mx-auto mt-16 max-w-4xl px-4 sm:px-6 lg:px-8">
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0h-2m10-6V9a5 5 0 0 0-10 0v2M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-bold text-brand-900">Bank-level security</p>
            <p class="mt-1 text-xs text-brand-900/70">
              256-bit TLS encryption. We never store card details on our servers.
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-3-3v6M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-bold text-brand-900">Tax-deductible</p>
            <p class="mt-1 text-xs text-brand-900/70">
              Registered 501(c)(3). Receipts are emailed within 5 minutes.
            </p>
          </div>
        </div>
        <div class="flex items-start gap-3 rounded-2xl border border-brand-100 bg-white p-5">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sunset-50 text-sunset-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-bold text-brand-900">Cancel anytime</p>
            <p class="mt-1 text-xs text-brand-900/70">
              Monthly gifts can be paused or cancelled from your donor portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
