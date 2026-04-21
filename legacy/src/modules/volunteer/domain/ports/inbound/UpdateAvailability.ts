import { UseCase } from "../../../../../shared/application/UseCase";

export interface UpdateAvailabilityInput {
  volunteerId: string;
  availability: {
    days: string[];
    hoursPerWeek: number;
    timezone: string;
    preferRemote: boolean;
  };
}

export interface UpdateAvailabilityOutput {
  volunteerId: string;
}

export interface UpdateAvailability
  extends UseCase<UpdateAvailabilityInput, UpdateAvailabilityOutput> {}
