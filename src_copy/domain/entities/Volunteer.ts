/**
 * Volunteer Domain Entity
 * Pure business object — zero framework dependencies.
 */
export interface Volunteer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  availability: 'weekdays' | 'weekends' | 'flexible';
  areaOfInterest: string;
  skills: string;
  message: string;
  submittedAt: Date;
}

/**
 * Value Object for the volunteer application form payload.
 * Used as input to the SubmitVolunteerUseCase.
 */
export interface VolunteerApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  availability: 'weekdays' | 'weekends' | 'flexible';
  areaOfInterest: string;
  skills: string;
  message: string;
}
