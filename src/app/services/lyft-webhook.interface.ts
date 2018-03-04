import { Passenger, RequestStatus } from '../app.api';

interface Loctype {
    lat: number;
    lng: number;
    eta_seconds?: number;
    address?: string;
}

interface DriverType {
    phone_number: string;
    rating: string;
    first_name: string;
    image_url: string;
}

interface LyftLocationType {
    lat: number;
    bearing: number;
    lng: number;
}

interface VehicleType {
    color: string;
    make: string;
    license_plate: string;
    image_url: string;
    year: number;
    license_plate_state: string;
    model: string;
}

interface EventType {
    origin: Loctype;
    passenger: Passenger;
    requested_at: string;
    route_url: string;
    ride_id: string;
    destination: Loctype;
    driver: DriverType;
    can_cancel: string[];
    canceled_by: string;
    status: RequestStatus;
    location: LyftLocationType;
    generated_at: string;
    vehicle: VehicleType;
    ride_type: string;
    pricing_details_url: string;
    price: PriceType;
    ride_profile: string;
}

interface PriceType {
    currency: string;
    amount: number;
    description: string;
}

export interface LyftWebhookParams {
    event_id: string;
    href: string;
    occurred_at: string;
    event_type: string;
    event: EventType;
}