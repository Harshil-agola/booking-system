import mongoose from "mongoose";
import { ENV_CONFIG } from "./env";
import dns from 'dns';

export const connectDatabase = async() => {
    try{
        dns.setServers(['8.8.8.8', '8.8.4.4']);
        await mongoose.connect(ENV_CONFIG.DATABASE_URL as string);
        console.log("Database connected successfully");
    }catch (error) {
        console.error("Database connection failed", error);
    }
}