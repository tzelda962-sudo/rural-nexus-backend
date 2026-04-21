import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { Money } from "../../../../shared/domain/value-objects/Money";

export class FundingGoal {
  private constructor(
    readonly target: Money,
    readonly isFlexible: boolean,
  ) {}

  static create(target: Money, isFlexible: boolean): FundingGoal {
    if (target.amountCents < 1000) {
      throw new ValidationError(
        "Funding goal must be at least 1000 cents (10.00)",
      );
    }
    return new FundingGoal(target, isFlexible);
  }

  static rehydrate(target: Money, isFlexible: boolean): FundingGoal {
    return new FundingGoal(target, isFlexible);
  }

  isReached(raised: Money): boolean {
    return raised.isGreaterThanOrEqual(this.target);
  }

  equals(other?: FundingGoal): boolean {
    if (!other) return false;
    return (
      this.target.equals(other.target) && this.isFlexible === other.isFlexible
    );
  }
}
