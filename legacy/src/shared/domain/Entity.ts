import { UniqueId } from "./value-objects/UniqueId";

export abstract class Entity<TProps> {
  protected readonly _id: UniqueId;
  protected props: TProps;

  constructor(id: UniqueId, props: TProps) {
    this._id = id;
    this.props = props;
  }

  get id(): UniqueId {
    return this._id;
  }

  equals(other?: Entity<TProps>): boolean {
    if (!other) return false;
    if (this === other) return true;
    return this._id.equals(other._id);
  }
}
