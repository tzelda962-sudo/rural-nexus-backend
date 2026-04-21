import { ValidationError } from "../../../../shared/domain/errors/ValidationError";

export type Proficiency = "BEGINNER" | "INTERMEDIATE" | "EXPERT";

export const PROFICIENCIES: readonly Proficiency[] = [
  "BEGINNER",
  "INTERMEDIATE",
  "EXPERT",
];

export class Skill {
  private constructor(
    readonly name: string,
    readonly proficiency: Proficiency,
  ) {}

  static create(name: string, proficiency: Proficiency): Skill {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 60) {
      throw new ValidationError("Skill name must be 1–60 characters");
    }
    if (!(PROFICIENCIES as readonly string[]).includes(proficiency)) {
      throw new ValidationError(`Invalid proficiency: ${proficiency}`);
    }
    return new Skill(trimmed, proficiency);
  }

  equals(other?: Skill): boolean {
    if (!other) return false;
    return (
      this.name.toLowerCase() === other.name.toLowerCase() &&
      this.proficiency === other.proficiency
    );
  }

  toJSON(): { name: string; proficiency: Proficiency } {
    return { name: this.name, proficiency: this.proficiency };
  }
}
