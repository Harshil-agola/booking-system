import mongoose, { Schema, Types } from 'mongoose';

interface SeatsTypes {
    tripId: Types.ObjectId;
    bookingId?: Types.ObjectId;
    row: number;
    column: string;
    label: string;
    status: 'available' | 'booked';
}

const seatsSchema = new Schema<SeatsTypes>({
    tripId: {
        type: Schema.Types.ObjectId,
        ref: 'Trips',
    },
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: 'Bookings',
    },
    label: {
        type: String,
        required: true
    },
    row: {
        type: Number,
        required: true
    },
    column: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'booked'],
        default: 'available'
    }
},
    {
        timestamps: true
    });

seatsSchema.index({ tripId: 1, label: 1 }, { unique: true });
seatsSchema.index({ tripId: 1, status: 1 });
seatsSchema.index({ bookingId: 1 });
export const Seats = mongoose.model('Seats', seatsSchema);