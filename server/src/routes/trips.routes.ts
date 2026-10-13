import {Router} from "express";
import { getTrips, getTripById } from "../controllers/trips.controller";
import { getSeatsByTripId } from "../controllers/seats.controller";

const router:Router = Router();

router.get("/", getTrips);
router.get("/:id", getTripById);
router.get("/:tripId/seats", getSeatsByTripId);

export { router as tripsRouter };