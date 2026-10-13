import mongoose, { Document, Schema, Types } from 'mongoose';

export interface BookingTypes {
    tripId: Types.ObjectId;
    passengerName: string;
    passengerPhone: string;
    seats: Types.ObjectId[];
    totalAmount: number;
    bookingStatus: 'pending' | 'confirmed' | 'cancelled';
}

const bookingsSchema = new Schema<BookingTypes>({
    tripId: {
        type: Schema.Types.ObjectId,
        ref: 'Trips',
    },
    seats: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "Seats"
        }]
    },
    passengerName: {
        type: String,
        required: true
    },
    passengerPhone: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'confirmed'
    }
}, {
    timestamps: true
});

bookingsSchema.index({ passengerPhone: 1 });
bookingsSchema.index({ tripId: 1 });
export const Bookings = mongoose.model('Bookings', bookingsSchema);