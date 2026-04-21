import { Entity } from "../../../../shared/domain/Entity";
import { ValidationError } from "../../../../shared/domain/errors/ValidationError";
import { UniqueId } from "../../../../shared/domain/value-objects/UniqueId";

interface CampaignUpdateProps {
  campaignId: UniqueId;
  authorId: UniqueId;
  title: string;
  body: string;
  imageUrls: string[];
  createdAt: Date;
}

export class CampaignUpdate extends Entity<CampaignUpdateProps> {
  static create(params: {
    campaignId: UniqueId;
    authorId: UniqueId;
    title: string;
    body: string;
    imageUrls?: string[];
  }): CampaignUpdate {
    if (!params.title || params.title.trim().length === 0) {
      throw new ValidationError("Update title is required");
    }
    if (!params.body || params.body.trim().length === 0) {
      throw new ValidationError("Update body is required");
    }

    return new CampaignUpdate(UniqueId.generate(), {
      campaignId: params.campaignId,
      authorId: params.authorId,
      title: params.title.trim(),
      body: params.body.trim(),
      imageUrls: params.imageUrls ?? [],
      createdAt: new Date(),
    });
  }

  static rehydrate(id: UniqueId, props: CampaignUpdateProps): CampaignUpdate {
    return new CampaignUpdate(id, props);
  }

  get campaignId(): UniqueId {
    return this.props.campaignId;
  }
  get authorId(): UniqueId {
    return this.props.authorId;
  }
  get title(): string {
    return this.props.title;
  }
  get body(): string {
    return this.props.body;
  }
  get imageUrls(): string[] {
    return [...this.props.imageUrls];
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
