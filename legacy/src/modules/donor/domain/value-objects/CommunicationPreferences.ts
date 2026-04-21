import { NotificationChannel } from "../../../notification/domain/value-objects/NotificationChannel";

export interface CommunicationPreferences {
  receiveNewsletter: boolean;
  receiveUpdates: boolean;
  preferredChannel: NotificationChannel;
}

export const DEFAULT_COMM_PREFS: CommunicationPreferences = {
  receiveNewsletter: true,
  receiveUpdates: true,
  preferredChannel: "EMAIL",
};
