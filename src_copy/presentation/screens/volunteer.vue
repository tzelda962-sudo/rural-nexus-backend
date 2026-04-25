<script setup lang="ts">
import { ref, reactive } from 'vue';
import { SubmitVolunteerUseCase } from '@application/use_cases/SubmitVolunteerUseCase';
import { MockVolunteerRepository } from '@infrastructure/repositories/MockVolunteerRepository';
import type { FeaturedVolunteer } from '@domain/repositories/IVolunteerRepository';
import type { VolunteerApplication } from '@domain/entities/Volunteer';

useHead({ title: 'Volunteer — RuralNexus' });

// Dependency injection at the composition root
const repo = new MockVolunteerRepository();
const useCase = new SubmitVolunteerUseCase(repo);

// Featured volunteers from the mock repository
const { data: volunteers } = await useAsyncData<FeaturedVolunteer[]>(
  'featuredVolunteers',
  () => repo.getFeaturedVolunteers(),
);

// Form state
const form = reactive<VolunteerApplication>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  availability: 'flexible',
  areaOfInterest: '',
  skills: '',
  message: '',
});

type Status = '' | 'submitting' | 'success' | 'error';
const status = ref<Status>('');
const errorMessage = ref('');

const areasOfInterest = [
  'Project Acquisition & Grants (PA1)',
  'Press, Media & Dissemination (PA2)',
  'Field Research & Transdisciplinary Studies (PA3)',
  'Capacity Building & Training (PA4)',
  'Sustainability Auditing & Consultancy (PA5)',
  'GIS, Data & Technology',
  'Community Outreach & Liaison',
  'Fundraising & Partnerships',
  'Other',
];

async function handleSubmit() {
  status.value = 'submitting';
  errorMessage.value = '';
  try {
    await useCase.execute({ ...form });
    status.value = 'success';
  } catch (err: unknown) {
    status.value = 'error';
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  }
}

const stats = [
  { value: '340+', label: 'Active Volunteers' },
  { value: '28', label: 'Countries' },
  { value: '12,000+', label: 'Hours contributed in 2025' },
  { value: '6', label: 'Program Areas' },
];

const howItWorks = [
  {
    step: '01',
    title: 'Apply Online',
    description:
      'Complete the short application form below. Tell us about your skills, availability, and what drives you to work in rural development.',
  },
  {
    step: '02',
    title: 'Intro Call',
    description:
      "Our volunteer coordinator will schedule a brief video call within 5 business days to get to know you and find the best fit within our program areas.",
  },
  {
    step: '03',
    title: 'Onboarding & Matching',
    description:
      'You will receive a tailored onboarding package and be matched with a project team or ongoing initiative that aligns with your expertise.',
  },
  {
    step: '04',
    title: 'Start Volunteering',
    description:
      'Begin contributing — remotely or in the field — with full support from your team lead and access to our internal knowledge base.',
  },
];
</script>

<template>
  <div class="flex flex-col bg-surface">
    <!-- Hero -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container py-24 text-white"
    >
      <!-- Hex watermark -->
      <div
        class="hex-mask absolute -right-24 -top-16 h-96 w-96 bg-white opacity-[0.04] pointer-events-none"
      />
      <div
        class="hex-mask absolute -bottom-24 left-12 h-72 w-72 bg-leaf opacity-[0.06] pointer-events-none"
      />

      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center hex-mask bg-white/10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <p class="text-sm font-bold uppercase tracking-widest opacity-70">Join Our Network</p>
        <h1 class="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          Volunteer with RuralNexus
        </h1>
        <p class="mx-auto mt-6 max-w-2xl font-body text-lg leading-relaxed opacity-85">
          We believe that lasting rural resilience is built by people — researchers, farmers,
          technologists, communicators — working together. Bring your skills to the field (or the
          laptop) and make a measurable difference.
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#apply"
            class="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Apply Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-5 w-5"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
          <a
            href="#how-it-works"
            class="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            How It Works
          </a>
        </div>
      </div>
    </section>

    <!-- Impact stats -->
    <section class="bg-surface-container-low py-14">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex flex-col items-center text-center"
          >
            <span class="font-display text-4xl font-bold text-primary">{{ stat.value }}</span>
            <span class="mt-1 text-sm font-medium text-on-surface-variant">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="how-it-works" class="py-24 bg-surface">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-primary">The Process</p>
          <h2 class="mt-3 font-display text-3xl font-bold text-on-surface md:text-4xl">
            How volunteering works
          </h2>
        </div>
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="step in howItWorks"
            :key="step.step"
            class="relative flex flex-col rounded-2xl bg-surface-container-low p-8 ambient-shadow"
          >
            <span class="mb-4 font-display text-5xl font-bold text-outline-variant leading-none">{{
              step.step
            }}</span>
            <h3 class="font-display text-lg font-semibold text-on-surface">{{ step.title }}</h3>
            <p class="mt-3 font-body text-sm leading-relaxed text-on-surface-variant">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured volunteers -->
    <section class="bg-surface-container-low py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-primary">Volunteer Stories</p>
          <h2 class="mt-3 font-display text-3xl font-bold text-on-surface md:text-4xl">
            Voices from our community
          </h2>
          <p class="mx-auto mt-4 max-w-xl font-body text-on-surface-variant">
            Real people. Real impact. Here is what some of our volunteers have to say.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="vol in volunteers"
            :key="vol.id"
            class="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest ambient-shadow transition hover:-translate-y-1"
          >
            <!-- Card accent gradient -->
            <div
              class="h-2 w-full bg-gradient-to-r"
              :class="vol.gradient"
            />
            <div class="flex flex-1 flex-col p-8">
              <!-- Avatar + name -->
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-display text-lg font-bold text-white"
                  :class="vol.gradient"
                >
                  {{ vol.initials }}
                </div>
                <div>
                  <p class="font-display font-bold text-on-surface">{{ vol.name }}</p>
                  <p class="text-xs text-on-surface-variant">
                    {{ vol.role }} · {{ vol.location }}
                  </p>
                </div>
              </div>

              <!-- Quote -->
              <blockquote class="mt-6 flex-1 font-body text-sm leading-relaxed text-on-surface-variant">
                "{{ vol.quote }}"
              </blockquote>

              <!-- Tags -->
              <div class="mt-6 flex flex-wrap gap-2">
                <span
                  class="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary"
                >
                  {{ vol.program }}
                </span>
                <span
                  class="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-medium text-on-surface-variant"
                >
                  Since {{ vol.since }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Application Form -->
    <section id="apply" class="bg-surface py-24">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-primary">Get Involved</p>
          <h2 class="mt-3 font-display text-3xl font-bold text-on-surface md:text-4xl">
            Apply to volunteer
          </h2>
          <p class="mx-auto mt-4 max-w-xl font-body text-on-surface-variant">
            Applications are reviewed on a rolling basis. Our volunteer coordinator will reach out
            within 5 business days.
          </p>
        </div>

        <!-- Success state -->
        <div
          v-if="status === 'success'"
          class="mx-auto max-w-lg rounded-2xl bg-leaf/10 border border-leaf/30 p-12 text-center"
        >
          <div
            class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-leaf/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-leaf"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
            </svg>
          </div>
          <h3 class="font-display text-2xl font-bold text-on-surface">Application Received!</h3>
          <p class="mt-3 font-body text-on-surface-variant">
            Thank you for applying to volunteer with RuralNexus. We will be in touch within 5
            business days.
          </p>
        </div>

        <!-- Form -->
        <form
          v-else
          class="rounded-2xl bg-surface-container-lowest p-8 md:p-12 ambient-shadow"
          @submit.prevent="handleSubmit"
        >
          <div class="grid gap-6 md:grid-cols-2">
            <!-- First name -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface">First Name *</label>
              <input
                v-model="form.firstName"
                type="text"
                required
                placeholder="Jane"
                class="w-full rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            <!-- Last name -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface">Last Name *</label>
              <input
                v-model="form.lastName"
                type="text"
                required
                placeholder="Doe"
                class="w-full rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            <!-- Email -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface">Email Address *</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="jane.doe@example.com"
                class="w-full rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            <!-- Phone -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface">Phone Number</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                class="w-full rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            <!-- Location -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface">Your Location</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="City, Country"
                class="w-full rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
              />
            </div>
            <!-- Availability -->
            <div>
              <label class="mb-2 block text-sm font-semibold text-on-surface">Availability *</label>
              <select
                v-model="form.availability"
                required
                class="w-full appearance-none rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
              >
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>

          <!-- Area of interest (full width) -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-semibold text-on-surface">Area of Interest *</label>
            <select
              v-model="form.areaOfInterest"
              required
              class="w-full appearance-none rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Select a program area…</option>
              <option v-for="area in areasOfInterest" :key="area" :value="area">{{ area }}</option>
            </select>
          </div>

          <!-- Skills -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-semibold text-on-surface">Relevant Skills</label>
            <input
              v-model="form.skills"
              type="text"
              placeholder="e.g. GIS, data analysis, translation, project management…"
              class="w-full rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Message -->
          <div class="mt-6">
            <label class="mb-2 block text-sm font-semibold text-on-surface">Why do you want to volunteer?</label>
            <textarea
              v-model="form.message"
              rows="4"
              placeholder="Tell us a little about yourself and what motivates you to work in rural development…"
              class="w-full resize-none rounded-lg bg-surface-container-low px-4 py-3 font-body outline-none transition focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Error state -->
          <div
            v-if="status === 'error'"
            class="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ errorMessage }}
          </div>

          <!-- Submit -->
          <div class="mt-8">
            <button
              id="volunteer-submit-btn"
              type="submit"
              :disabled="status === 'submitting'"
              class="inline-flex w-full items-center justify-center gap-3 rounded-lg bg-primary py-4 font-bold text-on-primary transition hover:opacity-90 disabled:opacity-60"
            >
              <span v-if="status !== 'submitting'">Submit Application</span>
              <span v-else class="animate-pulse">Submitting…</span>
              <svg
                v-if="status !== 'submitting'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </div>
          <p class="mt-4 text-center text-xs text-on-surface-variant">
            By submitting, you agree to our
            <a href="#" class="underline hover:text-on-surface">Privacy Policy</a>. We never share
            your data with third parties.
          </p>
        </form>
      </div>
    </section>


  </div>
</template>
