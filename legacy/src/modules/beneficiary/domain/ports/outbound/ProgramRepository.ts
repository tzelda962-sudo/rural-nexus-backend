import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Program } from "../../entities/Program";

export interface ProgramRepository {
  save(program: Program): Promise<void>;
  findById(id: UniqueId): Promise<Program | null>;
  findAll(): Promise<Program[]>;
}
