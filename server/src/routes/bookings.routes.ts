import {Router} from "express";
import { getBookings, getBookingById, createBooking, cancelBooking } from "../controllers/bookings.controller";

const router:Router = Router();

router.get("/", getBookings);
router.post("/", createBooking);
router.get("/:id", getBookingById);
router.delete("/:id", cancelBooking);

export { router as bookingsRouter };