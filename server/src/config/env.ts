import { config } from "dotenv"

config()

export const ENV_CONFIG = {
    PORT: process.env.PORT || "8080",
    DATABASE_URL: process.env.DATABASE_URL as string,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || "http://localhost:3000"
}