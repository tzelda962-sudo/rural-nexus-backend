import { UseCase } from "../../../../../shared/application/UseCase";

export interface RegisterVolunteerInput {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  skills: Array<{ name: string; proficiency: string }>;
  availability: {
    days: string[];
    hoursPerWeek: number;
    timezone: string;
    preferRemote: boolean;
  };
  notes?: string;
}

export interface RegisterVolunteerOutput {
  volunteerId: string;
}

export interface RegisterVolunteer
  extends UseCase<RegisterVolunteerInput, RegisterVolunteerOutput> {}
