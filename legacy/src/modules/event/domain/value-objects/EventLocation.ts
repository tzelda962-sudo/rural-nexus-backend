import { ValidationError } from "../../../../shared/domain/errors/ValidationError";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface EventLocationProps {
  venue: string;
  address: string;
  coordinates: Coordinates | null;
  isVirtual: boolean;
  virtualLink: string | null;
}

export class EventLocation {
  private constructor(private readonly props: EventLocationProps) {}

  static create(props: EventLocationProps): EventLocation {
    if (!props.venue.trim()) {
      throw new ValidationError("Venue name is required");
    }
    if (!props.address.trim()) {
      throw new ValidationError("Address is required");
    }
    if (props.isVirtual && !props.virtualLink?.trim()) {
      throw new ValidationError("Virtual link is required for virtual events");
    }
    if (props.coordinates) {
      if (props.coordinates.lat < -90 || props.coordinates.lat > 90) {
        throw new ValidationError("Latitude must be between -90 and 90");
      }
      if (props.coordinates.lng < -180 || props.coordinates.lng > 180) {
        throw new ValidationError("Longitude must be between -180 and 180");
      }
    }
    return new EventLocation({
      venue: props.venue.trim(),
      address: props.address.trim(),
      coordinates: props.coordinates,
      isVirtual: props.isVirtual,
      virtualLink: props.virtualLink?.trim() ?? null,
    });
  }

  get venue(): string {
    return this.props.venue;
  }
  get address(): string {
    return this.props.address;
  }
  get coordinates(): Coordinates | null {
    return this.props.coordinates;
  }
  get isVirtual(): boolean {
    return this.props.isVirtual;
  }
  get virtualLink(): string | null {
    return this.props.virtualLink;
  }

  toJSON(): EventLocationProps {
    return { ...this.props };
  }
}
