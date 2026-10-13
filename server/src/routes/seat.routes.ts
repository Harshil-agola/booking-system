import {Router} from "express";
import { getSeats, getSeatsByTripId } from "../controllers/seats.controller";

const router:Router = Router();

router.get("/", getSeats);
router.get("/:tripId", getSeatsByTripId);

export { router as seatsRouter };