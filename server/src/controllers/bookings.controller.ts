import { Request, Response } from "express";
import { Bookings, BookingTypes } from "../models/bookings.model";
import { createBookingSchema } from "../validations/index.js";
import mongoose from "mongoose";
import { Trips } from "../models/trips.model";
import { Seats } from "../models/seats.model";

interface HttpError extends Error {
    statusCode?: number;
}

export const getBookings = async (req: Request, res: Response) => {
    try {
        const { phone } = req.query;

        const filter = phone ? { passengerPhone: String(phone).trim() } : {};

        const bookings = await Bookings.find(filter)
            .populate('tripId')
            .populate('seats')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: bookings || []
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching bookings",
        });
    }
};

export const getBookingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const booking = await Bookings.findById(id)
            .populate('tripId')
            .populate('seats');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: booking
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching booking",
        });
    }
};

export const createBooking = async (req: Request, res: Response) => {
    const tripId = req.body.tripId;
    const rawSeats = (req.body.seatIds || req.body.seats || []) as string[];
    const passengerName = req.body.passengerName || req.body.name;
    let passengerPhone = String(req.body.passengerPhone || req.body.phone || "").replace(/\D/g, "");
    if (passengerPhone.length === 12 && passengerPhone.startsWith("91")) {
        passengerPhone = passengerPhone.slice(2);
    } else if (passengerPhone.length === 11 && passengerPhone.startsWith("0")) {
        passengerPhone = passengerPhone.slice(1);
    }
    const bookingStatus = req.body.bookingStatus || 'confirmed';

    const parsedResult = createBookingSchema.safeParse({
        tripId,
        seats: rawSeats,
        passengerName,
        passengerPhone,
        bookingStatus
    });

    if (!parsedResult.success) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: parsedResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }))
        });
    }

    const parsedData = parsedResult.data;

    try {
        const trip = await Trips.findById(parsedData.tripId);
        if (!trip || !trip.pricePerSeat) {
            return res.status(404).json({
                success: false,
                message: "Trip not found or price per seat not defined"
            });
        }

        const isAllObjectIds = parsedData.seats.every((s: string) => mongoose.Types.ObjectId.isValid(s) && s.length === 24);
        const seatQuery = isAllObjectIds
            ? { _id: { $in: parsedData.seats }, tripId: trip._id }
            : { label: { $in: parsedData.seats }, tripId: trip._id };

        const resolvedSeats = await Seats.find(seatQuery);

        if (resolvedSeats.length !== parsedData.seats.length) {
            return res.status(400).json({
                success: false,
                message: "One or more selected seats do not exist or do not belong to this trip"
            });
        }

        const seatObjectIds = resolvedSeats.map(s => s._id);

        const session = await mongoose.startSession();
        try {
            let booking: (mongoose.Document & BookingTypes) | null = null;

            await session.withTransaction(async () => {
                const availableSeats = await Seats.find({
                    _id: { $in: seatObjectIds },
                    tripId: trip._id,
                    status: 'available'
                }).session(session);

                if (availableSeats.length !== seatObjectIds.length) {
                    const conflictErr: HttpError = new Error("One or more selected seats are already booked");
                    conflictErr.statusCode = 409;
                    throw conflictErr;
                }

                const calculatedTotal = seatObjectIds.length * trip.pricePerSeat;

                const [createdBooking] = await Bookings.create(
                    [{
                        tripId: trip._id,
                        passengerName: parsedData.passengerName,
                        passengerPhone: parsedData.passengerPhone,
                        seats: seatObjectIds,
                        totalAmount: calculatedTotal,
                        bookingStatus: parsedData.bookingStatus
                    }],
                    { session }
                );

                const response = await Seats.updateMany(
                    {
                        _id: { $in: seatObjectIds },
                        tripId: trip._id,
                        status: 'available'
                    },
                    {
                        $set: {
                            status: 'booked',
                            bookingId: createdBooking._id
                        }
                    },
                    { session }
                );

                if (response.modifiedCount !== seatObjectIds.length) {
                    const conflictErr: HttpError = new Error("One or more selected seats are already booked");
                    conflictErr.statusCode = 409;
                    throw conflictErr;
                }

                booking = createdBooking as unknown as (mongoose.Document & BookingTypes);
            });

            return res.status(201).json({
                success: true,
                message: "Booking confirmed successfully",
                data: booking
            });

        } catch (txErr: unknown) {
            const err = txErr as HttpError;
            const status = err.statusCode || 500;
            return res.status(status).json({
                success: false,
                message: err.message || "Error creating booking"
            });
        } finally {
            session.endSession();
        }

    } catch (err: unknown) {
        const error = err as Error;
        return res.status(500).json({
            success: false,
            message: error.message || "Error creating booking"
        });
    }
};

export const cancelBooking = async (req: Request, res: Response) => {
    const { id } = req.params;

    const session = await mongoose.startSession();
    try {
        let cancelledBooking: (mongoose.Document & BookingTypes) | null = null;

        await session.withTransaction(async () => {
            const booking = await Bookings.findById(id).session(session);

            if (!booking) {
                const notFound: HttpError = new Error("Booking not found");
                notFound.statusCode = 404;
                throw notFound;
            }

            if (booking.bookingStatus === 'cancelled') {
                const badReq: HttpError = new Error("Booking is already cancelled");
                badReq.statusCode = 400;
                throw badReq;
            }

            booking.bookingStatus = 'cancelled';
            await booking.save({ session });

            await Seats.updateMany(
                { _id: { $in: booking.seats } },
                {
                    $set: {
                        status: 'available',
                        bookingId: null
                    }
                },
                { session }
            );

            cancelledBooking = booking;
        });

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: cancelledBooking
        });

    } catch (err: unknown) {
        const error = err as HttpError;
        const status = error.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: error.message || "Error cancelling booking"
        });
    } finally {
        session.endSession();
    }
};
