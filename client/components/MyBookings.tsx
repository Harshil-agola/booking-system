"use client";

import React, { useState } from "react";
import { getBookings, cancelBooking } from "@/actions/bookings.action";
import type { Booking } from "@/types";

interface MyBookingsProps {
    onBookingCancelled?: () => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onBookingCancelled }) => {
    const [phone, setPhone] = useState<string>("");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [searched, setSearched] = useState<boolean>(false);

    const handleSearch = async (e?: React.SubmitEvent) => {
        if (e) e.preventDefault();
        const trimmedPhone = phone.trim().replace(/\D/g, "");
        if (trimmedPhone.length !== 10) {
            setMessage("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        setMessage(null);
        try {
            const res = await getBookings(trimmedPhone);
            if (res.success) {
                setBookings(res.data);
                setSearched(true);
                if (res.data.length === 0) {
                    setMessage("No bookings found for this number.");
                }
            } else {
                setMessage(res.message || "Failed to fetch bookings");
            }
        } catch {
            setMessage("An error occurred while fetching bookings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (bookingId: string) => {


        setCancellingId(bookingId);
        setMessage(null);
        try {
            const res = await cancelBooking(bookingId);
            if (res.success) {
                setMessage("Booking cancelled successfully. Seats have been released.");
                setBookings((prev) =>
                    prev.map((b) => (b._id === bookingId ? { ...b, bookingStatus: "cancelled" } : b))
                );
                if (onBookingCancelled) {
                    onBookingCancelled();
                }
            } else {
                setMessage(res.message || "Failed to cancel booking");
            }
        } catch {
            setMessage("An error occurred while cancelling booking");
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="border border-black p-4 bg-white text-black space-y-4">
            <h2 className="text-lg font-bold uppercase tracking-wide border-b border-black pb-2">
                See bookings by phone
            </h2>

            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 border border-black px-3 py-2 text-sm outline-none bg-white text-black"
                />
                <button
                    type="submit"
                    disabled={isLoading || phone.length !== 10}
                    className="border border-black bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-neutral-800 disabled:opacity-40"
                >
                    {isLoading ? "Searching..." : "Search"}
                </button>
            </form>

            {message && (
                <div className="border border-black p-2 text-xs font-medium">
                    {message}
                </div>
            )}

            {searched && bookings.length > 0 && (
                <div className="space-y-3 pt-2">
                    {bookings.map((booking) => {
                        const isCancelled = booking.bookingStatus === "cancelled";
                        const seatLabels = Array.isArray(booking.seats)
                            ? booking.seats.map((s) => (typeof s === "object" && s !== null ? s.label : String(s))).join(", ")
                            : "";
                        const tripInfo =
                            typeof booking.tripId === "object" && booking.tripId !== null
                                ? `${booking.tripId.startLocation} to ${booking.tripId.endLocation}`
                                : "Trip";

                        return (
                            <div key={booking._id} className="border border-black p-3 space-y-2">
                                <div className="flex justify-between items-start text-sm">
                                    <div>
                                        <p className="font-bold">{tripInfo}</p>
                                        <p className="text-xs text-neutral-600">ID: {booking._id}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 border border-black uppercase font-bold ${isCancelled ? "bg-neutral-200 text-neutral-600" : "bg-black text-white"}`}>
                                        {booking.bookingStatus}
                                    </span>
                                </div>

                                <div className="text-xs space-y-0.5 text-neutral-800">
                                    <p>Passenger: <strong>{booking.passengerName}</strong></p>
                                    <p>Phone: <strong>{booking.passengerPhone}</strong></p>
                                    <p>Seats: <strong>{seatLabels}</strong></p>
                                    <p>Total: <strong>Rs {booking.totalAmount}</strong></p>
                                </div>

                                {!isCancelled && (
                                    <button
                                        type="button"
                                        disabled={cancellingId === booking._id}
                                        onClick={() => handleCancel(booking._id)}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white border border-red-700 py-1.5 text-xs font-bold transition-none disabled:opacity-50"
                                    >
                                        {cancellingId === booking._id ? "Cancelling..." : "Cancel Booking"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
