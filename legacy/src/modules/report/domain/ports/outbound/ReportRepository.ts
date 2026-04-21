import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Report } from "../../entities/Report";

export interface ReportRepository {
  save(report: Report): Promise<void>;
  findById(id: UniqueId): Promise<Report | null>;
  findByUser(userId: UniqueId): Promise<Report[]>;
}
