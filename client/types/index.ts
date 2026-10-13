export interface Seat {
    _id: string;
    tripId: string;
    bookingId?: string | null;
    row: number;
    column: string;
    label: string;
    status: 'available' | 'booked';
}

export interface Trip {
    _id: string;
    startLocation: string;
    endLocation: string;
    pricePerSeat: number;
    seats?: string[];
}

export interface Booking {
    _id: string;
    tripId: Trip | string;
    passengerName: string;
    passengerPhone: string;
    seats: Seat[] | string[];
    totalAmount: number;
    bookingStatus: 'pending' | 'confirmed' | 'cancelled';
    createdAt: string;
}
