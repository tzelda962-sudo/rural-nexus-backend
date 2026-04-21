export class TemplateId {
  static readonly DONATION_RECEIPT = new TemplateId("donation_receipt");
  static readonly DONATION_RECURRING_STARTED = new TemplateId(
    "recurring_started",
  );
  static readonly VOLUNTEER_WELCOME = new TemplateId("volunteer_welcome");
  static readonly VOLUNTEER_ASSIGNMENT = new TemplateId(
    "volunteer_assignment",
  );
  static readonly CAMPAIGN_UPDATE = new TemplateId("campaign_update");
  static readonly CAMPAIGN_GOAL_REACHED = new TemplateId(
    "campaign_goal_reached",
  );
  static readonly PASSWORD_RESET = new TemplateId("password_reset");
  static readonly EMAIL_VERIFICATION = new TemplateId("email_verification");

  constructor(readonly value: string) {}

  equals(other?: TemplateId): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
