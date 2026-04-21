import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { VolunteerAssignment } from "../../entities/VolunteerAssignment";

export interface AssignmentRepository {
  save(assignment: VolunteerAssignment): Promise<void>;
  findById(id: UniqueId): Promise<VolunteerAssignment | null>;
  findByVolunteer(volunteerId: UniqueId): Promise<VolunteerAssignment[]>;
  findByCampaign(campaignId: UniqueId): Promise<VolunteerAssignment[]>;
  findActiveByVolunteerAndCampaign(
    volunteerId: UniqueId,
    campaignId: UniqueId,
  ): Promise<VolunteerAssignment | null>;
}
