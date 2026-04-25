import type { Volunteer, VolunteerApplication } from '@domain/entities/Volunteer';

/**
 * Port (Interface) for the Volunteer repository.
 * The domain defines this contract; infrastructure implements it.
 */
export interface IVolunteerRepository {
  /**
   * Persists a new volunteer application.
   * Returns the created Volunteer entity with a server-assigned id.
   */
  submit(application: VolunteerApplication): Promise<Volunteer>;

  /**
   * Retrieves all volunteer testimonials / featured volunteers for display.
   */
  getFeaturedVolunteers(): Promise<FeaturedVolunteer[]>;
}

/** A lightweight read model for display on the volunteer page. */
export interface FeaturedVolunteer {
  id: string;
  name: string;
  role: string;
  location: string;
  since: string;
  quote: string;
  program: string;
  initials: string;
  gradient: string;
}
