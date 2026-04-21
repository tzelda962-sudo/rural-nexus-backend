import { Email } from "../../../../../shared/domain/value-objects/Email";
import { PhoneNumber } from "../../../../../shared/domain/value-objects/PhoneNumber";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Volunteer } from "../../../domain/entities/Volunteer";
import { Availability } from "../../../domain/value-objects/Availability";
import { Proficiency, Skill } from "../../../domain/value-objects/Skill";
import { VolunteerStatus } from "../../../domain/value-objects/VolunteerStatus";

export interface VolunteerRow {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
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
  notes: string;
  background_check_status: "PENDING" | "CLEARED" | "FLAGGED" | "NOT_REQUIRED";
  total_hours_logged: string | number;
  joined_at: Date;
  updated_at: Date;
}

export function volunteerFromRow(row: VolunteerRow): Volunteer {
  return Volunteer.rehydrate(UniqueId.fromString(row.id), {
    userId: UniqueId.fromString(row.user_id),
    firstName: row.first_name,
    lastName: row.last_name,
    email: Email.create(row.email),
    phone: row.phone ? PhoneNumber.create(row.phone) : null,
    skills: row.skills.map((s) =>
      Skill.create(s.name, s.proficiency as Proficiency),
    ),
    availability: Availability.create(row.availability),
    status: row.status,
    notes: row.notes,
    backgroundCheckStatus: row.background_check_status,
    totalHoursLogged: Number(row.total_hours_logged),
    joinedAt: row.joined_at,
    updatedAt: row.updated_at,
  });
}
