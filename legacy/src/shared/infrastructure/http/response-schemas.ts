import { z } from "zod";

// ── Shared ────────────────────────────────────────
const paginationMeta = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

function paginated(itemSchema: z.ZodTypeAny) {
  return z.object({ data: z.array(itemSchema), meta: paginationMeta });
}

// ── Error ─────────────────────────────────────────
export const errorResponse = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

// ── Auth / IAM ────────────────────────────────────
export const registerResponse = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
});

export const loginResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string()),
    permissions: z.array(z.string()),
  }),
});

export const refreshResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const logoutResponse = z.object({
  revoked: z.boolean(),
});

export const meResponse = z.object({
  user: z.object({
    userId: z.string().uuid(),
    roles: z.array(z.string()),
    permissions: z.array(z.string()),
  }),
});

export const assignRoleResponse = z.object({
  userId: z.string().uuid(),
  roles: z.array(z.string()),
});

const auditLogItem = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  action: z.string(),
  resource: z.string(),
  details: z.record(z.unknown()),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export const auditLogListResponse = paginated(auditLogItem);

// ── Donations ─────────────────────────────────────
export const createDonationIntentResponse = z.object({
  donationId: z.string().uuid(),
  clientSecret: z.string(),
  status: z.string(),
  reused: z.boolean(),
});

export const confirmDonationResponse = z.object({
  donationId: z.string().uuid(),
  status: z.string(),
});

export const refundDonationResponse = z.object({
  donationId: z.string().uuid(),
  status: z.string(),
});

const donationItem = z.object({
  id: z.string().uuid(),
  donorId: z.string().uuid().nullable(),
  donorEmail: z.string().email(),
  amountCents: z.number(),
  currency: z.string(),
  campaignId: z.string().uuid().nullable(),
  frequency: z.enum(["ONE_TIME", "MONTHLY", "QUARTERLY", "YEARLY"]),
  status: z.string(),
  paymentIntentId: z.string().nullable(),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  refundedAt: z.string().datetime().nullable(),
});
export const donationResponse = donationItem;
export const donationListResponse = paginated(donationItem);

// ── Campaigns ─────────────────────────────────────
export const createCampaignResponse = z.object({
  campaignId: z.string().uuid(),
  slug: z.string(),
});

const campaignListItem = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  coverImageUrl: z.string().nullable(),
  fundingGoalCents: z.number(),
  amountRaisedCents: z.number(),
  currency: z.string(),
  donationCount: z.number(),
  progressPercentage: z.number(),
  status: z.string(),
  tags: z.array(z.string()),
  startDate: z.string(),
  endDate: z.string().nullable(),
});
export const campaignListResponse = paginated(campaignListItem);

export const campaignDetailResponse = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  coverImageUrl: z.string().nullable(),
  fundingGoalCents: z.number(),
  amountRaisedCents: z.number(),
  currency: z.string(),
  isFlexibleGoal: z.boolean(),
  donationCount: z.number(),
  progressPercentage: z.number(),
  status: z.string(),
  tags: z.array(z.string()),
  isPublished: z.boolean(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publishCampaignResponse = z.object({ published: z.boolean() });

export const recordMetricResponse = z.object({
  metricId: z.string().uuid(),
});

export const aggregateMetricsResponse = z.object({
  totalPeopleServed: z.number(),
  totalFundsRaisedCents: z.number(),
  totalVolunteerHours: z.number(),
  activeCampaigns: z.number(),
  byCampaign: z.array(z.object({
    campaignId: z.string().uuid(),
    campaignTitle: z.string(),
    metrics: z.record(z.number()),
  })),
});

// ── Volunteers ────────────────────────────────────
export const registerVolunteerResponse = z.object({
  volunteerId: z.string().uuid(),
});

const volunteerItem = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  skills: z.array(z.object({ name: z.string(), proficiency: z.string() })),
  availability: z.object({
    days: z.array(z.string()),
    hoursPerWeek: z.number(),
    timezone: z.string(),
    preferRemote: z.boolean(),
  }),
  status: z.string(),
  totalHoursLogged: z.number(),
  joinedAt: z.string().datetime(),
});
export const volunteerResponse = volunteerItem;
export const volunteerListResponse = paginated(volunteerItem);

export const updateAvailabilityResponse = z.object({
  volunteerId: z.string().uuid(),
});

export const assignVolunteerResponse = z.object({
  assignmentId: z.string().uuid(),
});

const assignmentItem = z.object({
  id: z.string().uuid(),
  volunteerId: z.string().uuid(),
  campaignId: z.string().uuid(),
  role: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  hoursCommitted: z.number(),
  hoursLogged: z.number(),
  status: z.string(),
});
export const assignmentListResponse = z.array(assignmentItem);

// ── Events ────────────────────────────────────────
export const createEventResponse = z.object({
  eventId: z.string().uuid(),
});

const eventListItem = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  type: z.string(),
  location: z.object({
    venue: z.string(),
    address: z.string(),
    isVirtual: z.boolean(),
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxAttendees: z.number().nullable(),
  registrationCount: z.number(),
  availableSlots: z.number().nullable(),
  status: z.string(),
});
export const eventListResponse = paginated(eventListItem);

export const eventDetailResponse = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  type: z.string(),
  campaignId: z.string().uuid().nullable(),
  location: z.object({
    venue: z.string(),
    address: z.string(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).nullable(),
    isVirtual: z.boolean(),
    virtualLink: z.string().nullable(),
  }),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxAttendees: z.number().nullable(),
  registrationCount: z.number(),
  availableSlots: z.number().nullable(),
  status: z.string(),
  createdAt: z.string().datetime(),
});

export const registerAttendeeResponse = z.object({
  registrationId: z.string().uuid(),
});

// ── Reports ───────────────────────────────────────
export const generateReportResponse = z.object({
  reportId: z.string().uuid(),
  status: z.string(),
  estimatedSeconds: z.number(),
});

export const reportStatusResponse = z.object({
  reportId: z.string().uuid(),
  type: z.string(),
  format: z.string(),
  title: z.string(),
  status: z.string(),
  downloadUrl: z.string().nullable(),
  expiresAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

// ── Donors ────────────────────────────────────────
export const donorProfileResponse = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tier: z.string(),
  totalDonatedCents: z.number(),
  currency: z.string(),
  donationCount: z.number(),
  firstDonationAt: z.string().datetime().nullable(),
  lastDonationAt: z.string().datetime().nullable(),
  isAnonymous: z.boolean(),
  communicationPreferences: z.object({
    receiveNewsletter: z.boolean(),
    receiveUpdates: z.boolean(),
    preferredChannel: z.string(),
  }),
});

// ── Beneficiaries ─────────────────────────────────
export const enrollBeneficiaryResponse = z.object({
  beneficiaryId: z.string().uuid(),
});

export const createProgramResponse = z.object({
  programId: z.string().uuid(),
});

const programItem = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  campaignId: z.string().uuid().nullable(),
  capacity: z.number(),
  enrolledCount: z.number(),
  status: z.string(),
});
export const programListResponse = z.array(programItem);

const beneficiaryItem = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string().nullable(),
  location: z.string(),
  notes: z.string().nullable(),
  status: z.string(),
  enrolledAt: z.string().datetime(),
});
export const beneficiaryListResponse = paginated(beneficiaryItem);

// ── Webhooks ──────────────────────────────────────
export const webhookResponse = z.object({
  processed: z.boolean(),
  action: z.string(),
});

// ── System ────────────────────────────────────────
export const healthResponse = z.object({
  status: z.enum(["ok", "degraded"]),
  uptimeSeconds: z.number(),
  checks: z.object({
    postgres: z.string(),
    redis: z.string(),
  }),
  version: z.string(),
});
