import { Pool } from "pg";
import { Email } from "../../../../../shared/domain/value-objects/Email";
import { UniqueId } from "../../../../../shared/domain/value-objects/UniqueId";
import { BaseRepository } from "../../../../../shared/infrastructure/database/BaseRepository";
import { Notification } from "../../../domain/entities/Notification";
import { NotificationRepository } from "../../../domain/ports/outbound/NotificationRepository";
import { NotificationChannel } from "../../../domain/value-objects/NotificationChannel";
import { NotificationStatus } from "../../../domain/value-objects/NotificationStatus";
import { TemplateId } from "../../../domain/value-objects/TemplateId";

interface NotificationRow {
  id: string;
  recipient_id: string | null;
  recipient_email: string;
  channel: NotificationChannel;
  template_id: string;
  subject: string;
  body: string;
  variables: Record<string, string>;
  status: NotificationStatus;
  sent_at: Date | null;
  failure_reason: string | null;
  retry_count: number;
  created_at: Date;
}

function fromRow(row: NotificationRow): Notification {
  return Notification.rehydrate(UniqueId.fromString(row.id), {
    recipientId: row.recipient_id
      ? UniqueId.fromString(row.recipient_id)
      : null,
    recipientEmail: Email.create(row.recipient_email),
    channel: row.channel,
    templateId: new TemplateId(row.template_id),
    subject: row.subject,
    body: row.body,
    variables: row.variables ?? {},
    status: row.status,
    sentAt: row.sent_at,
    failureReason: row.failure_reason,
    retryCount: row.retry_count,
    createdAt: row.created_at,
  });
}

const SELECT_COLUMNS = `id, recipient_id, recipient_email, channel, template_id,
    subject, body, variables, status, sent_at, failure_reason, retry_count, created_at`;

export class PgNotificationRepository
  extends BaseRepository
  implements NotificationRepository
{
  constructor(pool: Pool) {
    super(pool);
  }

  async save(notification: Notification): Promise<void> {
    await this.pool.query(
      `INSERT INTO notifications
         (id, recipient_id, recipient_email, channel, template_id,
          subject, body, variables, status, sent_at, failure_reason,
          retry_count, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         status         = EXCLUDED.status,
         sent_at        = EXCLUDED.sent_at,
         failure_reason = EXCLUDED.failure_reason,
         retry_count    = EXCLUDED.retry_count`,
      [
        notification.id.value,
        notification.recipientId?.value ?? null,
        notification.recipientEmail.value,
        notification.channel,
        notification.templateId.value,
        notification.subject,
        notification.body,
        JSON.stringify(notification.variables),
        notification.status,
        notification.sentAt,
        notification.failureReason,
        notification.retryCount,
        notification.createdAt,
      ],
    );
  }

  async findById(id: UniqueId): Promise<Notification | null> {
    const row = await this.queryOne<NotificationRow>(
      `SELECT ${SELECT_COLUMNS} FROM notifications WHERE id = $1`,
      [id.value],
    );
    return row ? fromRow(row) : null;
  }

  async findByRecipient(recipientId: UniqueId): Promise<Notification[]> {
    const rows = await this.query<NotificationRow>(
      `SELECT ${SELECT_COLUMNS} FROM notifications
        WHERE recipient_id = $1
        ORDER BY created_at DESC`,
      [recipientId.value],
    );
    return rows.map(fromRow);
  }

  async findByStatus(
    status: NotificationStatus,
    limit: number,
  ): Promise<Notification[]> {
    const rows = await this.query<NotificationRow>(
      `SELECT ${SELECT_COLUMNS} FROM notifications
        WHERE status = $1
        ORDER BY created_at ASC
        LIMIT $2`,
      [status, limit],
    );
    return rows.map(fromRow);
  }
}
