import { Volunteer } from "../../domain/entities/Volunteer";
import { VolunteerStatus } from "../../domain/value-objects/VolunteerStatus";

export interface VolunteerResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  skills: Array<{ name: string; proficiency: string }>;
  availability: {
    days: string[];
    hoursPerWeek: number;
    timezone: string;
    preferRemote: boolean;
  };
  status: VolunteerStatus;
  totalHoursLogged: number;
  joinedAt: string;
}

export function toVolunteerResponseDto(v: Volunteer): VolunteerResponseDto {
  return {
    id: v.id.value,
    userId: v.userId.value,
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email.value,
    phone: v.phone?.value ?? null,
    skills: v.skills.map((s) => s.toJSON()),
    availability: v.availability.toJSON(),
    status: v.status,
    totalHoursLogged: v.totalHoursLogged,
    joinedAt: v.joinedAt.toISOString(),
  };
}
