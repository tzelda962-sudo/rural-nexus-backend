export interface AssignVolunteerInput {
  volunteerId: string;
  campaignId: string;
  role: string;
  startDate: string;
  endDate?: string | null;
  hoursCommitted: number;
}

export interface AssignVolunteerOutput {
  assignmentId: string;
}

export interface AssignVolunteer {
  execute(input: AssignVolunteerInput): Promise<AssignVolunteerOutput>;
}
