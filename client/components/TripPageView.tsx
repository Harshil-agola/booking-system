"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { createBooking, getSeats, getTrips } from "@/actions/bookings.action";
import type { Seat, Trip, Booking } from "@/types";
import { RenderSeats } from "./Seats";

interface BookingFormValues {
    name: string;
    phone: string;
}

interface TripPageViewProps {
    id?: string;
    seats?: Seat[];
    trip?: Trip;
    allTrips?: Trip[];
}

export default function TripPageView({
    id: initialId = "",
    seats: initialSeats = [],
    trip: initialTrip,
    allTrips = [],
}: TripPageViewProps) {
    const [trip, setTrip] = useState<Trip | null>(initialTrip || null);
    const [tripId, setTripId] = useState<string>(initialId);
    const [seats, setSeats] = useState<Seat[]>(Array.isArray(initialSeats) ? initialSeats : []);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [seatError, setSeatError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<Booking | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<BookingFormValues>({
        mode: "onTouched",
        defaultValues: {
            name: "",
            phone: "",
        },
    });

    const loadData = useCallback(async (targetTripId?: string) => {
        const activeId = targetTripId || initialId;
        if (!activeId) return;

        try {
            const seatsRes = await getSeats(activeId);
            if (seatsRes.success) {
                if (Array.isArray(seatsRes.data) && seatsRes.data.length > 0) {
                    setSeats(seatsRes.data);
                }
                if (seatsRes.trip) {
                    setTrip(seatsRes.trip);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, [initialId]);

    useEffect(() => {
        if (initialSeats.length > 0) {
            setSeats(initialSeats);
        }
        if (initialTrip) {
            setTrip(initialTrip);
        }
        if (initialId) {
            setTripId(initialId);
        }
    }, [initialId, initialSeats, initialTrip]);

    const toggleSeat = (label: string, isBooked: boolean) => {
        if (isBooked) return;
        setSeatError(null);
        setApiError(null);

        setSelectedSeats((prev) => {
            if (prev.includes(label)) {
                return prev.filter((s) => s !== label);
            }
            if (prev.length >= 4) {
                setSeatError("Maximum 4 seats allowed per booking.");
                return prev;
            }
            return [...prev, label];
        });
    };

    const onSubmit = async (data: BookingFormValues) => {
        setSeatError(null);
        setApiError(null);

        if (selectedSeats.length === 0) {
            setSeatError("Please select at least 1 seat.");
            return;
        }

        try {
            const response = await createBooking({
                tripId: tripId || trip?._id || "",
                seats: selectedSeats,
                name: data.name.trim(),
                phone: data.phone.trim().replace(/\D/g, ""),
            });

            if (response.success && response.data) {
                setSuccessData(response.data);
                setSelectedSeats([]);
                reset();
                await loadData(tripId);
            } else if (response.status === 409) {
                setApiError("Selected seat(s) were just booked by someone else. Please pick another seat.");
                setSelectedSeats([]);
                await loadData(tripId);
            } else {
                setApiError(response.message || "Booking failed.");
            }
        } catch {
            setApiError("An unexpected error occurred.");
        }
    };

    const fromLocation = trip?.startLocation || "Ahmedabad";
    const toLocation = trip?.endLocation || "Mumbai";
    const pricePerSeat = trip?.pricePerSeat || 700;
    const totalAmount = selectedSeats.length * pricePerSeat;

    return (
        <div className="min-h-screen bg-white text-black p-4 sm:p-6 font-sans">
            <div className="max-w-xl mx-auto space-y-6">

                <div className="border-b border-black pb-3 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/" className="text-xs font-bold underline hover:no-underline">
                                All Trips
                            </Link>
                        </div>
                        <h1 className="text-xl font-bold uppercase tracking-wider">Bus Booking</h1>

                    </div>

                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="border border-black p-3 text-xs flex justify-between items-center">
                        <div>
                            <span className="text-neutral-500 block">Route</span>
                            <strong className="text-sm">{fromLocation} to {toLocation}</strong>
                        </div>
                        <div className="text-right">
                            <span className="text-neutral-500 block">Price / Seat</span>
                            <strong className="text-sm">Rs {pricePerSeat}</strong>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        {seatError && (
                            <p className="text-xs font-bold text-red-500 p-1">{seatError}</p>
                        )}

                        <RenderSeats
                            seats={seats}
                            selected={selectedSeats}
                            onToggle={toggleSeat}
                        />
                    </div>

                    <div className="border border-black p-3 text-xs flex justify-between items-center">
                        <div>
                            <span className="text-neutral-500 block">Selected Seats</span>
                            <strong>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</strong>
                        </div>
                        <div className="text-right">
                            <span className="text-neutral-500 block">Total</span>
                            <strong className="text-sm">Rs {totalAmount}</strong>
                        </div>
                    </div>

                    <div className="space-y-3 pt-1">
                        <div>
                            <label htmlFor="name" className="block text-xs font-bold uppercase mb-1">
                                Passenger Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter name"
                                className="w-full border border-black p-2 text-sm outline-none bg-white text-black"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                                })}
                            />
                            {errors.name && (
                                <p className="text-xs font-medium mt-1 text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-xs font-bold uppercase mb-1">
                                Mobile Number (10 digits)
                            </label>
                            <div className="flex border border-black">
                                <span className="px-3 py-2 text-xs font-bold border-r border-black bg-neutral-100 flex items-center">
                                    +91
                                </span>
                                <input
                                    id="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="9876543210"
                                    className="w-full p-2 text-sm outline-none bg-white text-black"
                                    {...register("phone", {
                                        required: "Phone number is required",
                                        validate: (val) => {
                                            const cleaned = val.replace(/\D/g, "");
                                            if (cleaned.length !== 10) {
                                                return "Phone number must be exactly 10 digits";
                                            }
                                            return true;
                                        },
                                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                            const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setValue("phone", digitsOnly, { shouldValidate: true });
                                        },
                                    })}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-xs text-red-500 font-medium mt-1">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || selectedSeats.length === 0}
                        className="w-full bg-black text-white py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:opacity-40"
                    >
                        {isSubmitting ? "Processing..." : `Confirm Booking`}
                    </button>

                    {successData && (
                        <div className="border-2 border-black p-3 text-xs space-y-1.5">
                            <p className="font-bold text-sm">Booking Confirmed</p>
                            <p>ID: <strong>{successData._id}</strong></p>
                            <p>Passenger: <strong>{successData.passengerName}</strong> ({successData.passengerPhone})</p>
                            <p>Total: <strong>Rs {successData.totalAmount}</strong></p>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSuccessData(null)}
                                    className="underline font-bold"
                                >
                                    Book Another Ticket
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSuccessData(null);
                                    }}
                                    className="underline font-bold"
                                >
                                    View / Cancel Booking
                                </button>
                            </div>
                        </div>
                    )}

                    {apiError && (
                        <div className="border border-black p-2.5 text-xs font-bold">
                            {apiError}
                        </div>
                    )}

                </form>

            </div>
        </div>
    );
}
