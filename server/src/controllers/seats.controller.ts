import { Request, Response } from "express";
import { Seats } from "../models/seats.model";
import { Trips } from "../models/trips.model";

export const getSeats = async(_req:Request,res:Response)=>{
    try{
        const seats = await Seats.find();

        return res.status(200).json({
            success: true,
            data: seats ?? [],
        })
       
    }catch(error){

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch seats',
        })
    }
}

export const getSeatsByTripId = async(req: Request, res: Response) => {
    try {
        const tripId = req.params.tripId;

        const trip = await Trips.findById(tripId);

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found',
            });
        }

        const seats = await Seats.find({ tripId }).sort({ row: 1, column: 1 });

        return res.status(200).json({
            success: true,
            trip,
            seats: seats ?? [],
            data: seats ?? [],
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch seats',
        });
    }
};