import mongoose from "mongoose";
import { ENV_CONFIG } from "../config/env";
import { Trips } from "../models/trips.model";
import { Seats } from "../models/seats.model";
import { Bookings } from "../models/bookings.model";
import dns from "dns";

const startScript = async () => {
    try {
        console.log("Script Start");
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
        await mongoose.connect(ENV_CONFIG.DATABASE_URL as string);

        await Promise.all([
            Trips.deleteMany({}),
            Seats.deleteMany({}),
            Bookings.deleteMany({}),
        ]);

        const trip = await Trips.create({
            startLocation: "Ahmedabad",
            endLocation: "Mumbai",
            pricePerSeat: 700,
            seats: [],
        });

        const seats = [];

        for (let row = 1; row <= 10; row++) {
            for (const column of ["A", "B", "C", "D"]) {
                const seatNumber = `${row}${column}`;
                const seat = {
                    tripId: trip._id,
                    row,
                    column,
                    label: seatNumber,
                    status: "available" as const,
                };
                seats.push(seat);
            }
        }

        const insertedSeats = await Seats.insertMany(seats);

        await Trips.updateOne(
            { _id: trip._id },
            { $set: { seats: insertedSeats.map((seat) => seat._id) } }
        );


        console.log("Script END");
    } catch (error) {
        console.error("Error executing seed script:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

startScript();
