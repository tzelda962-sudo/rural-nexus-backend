import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { Notification } from "../../entities/Notification";
import { NotificationStatus } from "../../value-objects/NotificationStatus";

export interface NotificationRepository {
  save(notification: Notification): Promise<void>;
  findById(id: UniqueId): Promise<Notification | null>;
  findByRecipient(recipientId: UniqueId): Promise<Notification[]>;
  findByStatus(status: NotificationStatus, limit: number): Promise<Notification[]>;
}
