import type { ProgramArea } from "../entities/ProgramArea";

export interface IProgramAreaRepository {
  getAll(): Promise<ProgramArea[]>;
  getById(id: string): Promise<ProgramArea | null>;
}
