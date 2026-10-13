import mongoose, { Schema, Types } from 'mongoose';

interface TripTypes {
    startLocation: string;
    endLocation: string;
    pricePerSeat: number;
    seats: Types.ObjectId[];
}

const tripsSchema = new Schema<TripTypes>({
    startLocation: {
        type: String,
        required: true,
    },
    endLocation: {
        type: String,
        required: true,
    },
    seats: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Seats',
        }
    ],
    pricePerSeat: {
        type: Number,
        required: true,
    }
});

tripsSchema.index({ startLocation: 1, endLocation: 1 });
export const Trips = mongoose.model<TripTypes>('Trips', tripsSchema);