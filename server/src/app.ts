import express, { type Application } from "express"
import cors from "cors"
import morgan from "morgan"
import { ENV_CONFIG } from "./config/env.js"
import { tripsRouter } from "./routes/trips.routes.js"
import { bookingsRouter } from "./routes/bookings.routes.js"
import { seatsRouter } from "./routes/seat.routes.js"

const app: Application = express()

app.use(cors({
    origin: ENV_CONFIG.CLIENT_ORIGIN,
    credentials: true
}))
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/api/trips", tripsRouter)
app.use("/api/bookings", bookingsRouter)
app.use("/api/seats", seatsRouter)

export default app;