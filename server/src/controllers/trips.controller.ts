import { Request, Response } from "express";
import { Trips } from "../models/trips.model";

export const getTrips = async (req: Request, res: Response) => {
    try {
        const trips = await Trips.find({})

        return res.status(200).json({
            success: true,
            data: trips || []
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching trips",
        })
    }
}

export const getTripById = async (req: Request, res: Response) => {
    try {
        const tripId = req.params.id;

        if (!tripId) {
            return res.status(400).json({
                success: false,
                message: "Trip ID is required",
            });
        }

        const trip = await Trips.findById(tripId);

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: "Trip not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: trip,
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error fetching trip",
        });
    }
};