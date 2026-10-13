import { z } from "zod";

export const createBookingSchema = z.object({
    tripId: z.string({ error: "Please provide a tripId" }).min(1, { message: "tripId is required" }),
    seats: z
        .array(z.string({ error: "Please provide seatId" }).min(1, { message: "seatId is required" }))
        .min(1, { message: "At least one seat is required" })
        .max(4, { message: "You can book a maximum of 4 seats" }),
    passengerName: z.string({ error: "Please provide a Name" }).min(2, { message: "Passenger Name is required" }),
    passengerPhone: z
        .string({ error: "Please provide a Phone" })
        .length(10, { message: "Please provide a valid 10-digit mobile number" }),
    totalAmount: z.number().optional(),
    bookingStatus: z.enum(['pending', 'confirmed', 'cancelled']).optional().default('confirmed')
});

export type CreateBookingTypes = z.infer<typeof createBookingSchema>;

