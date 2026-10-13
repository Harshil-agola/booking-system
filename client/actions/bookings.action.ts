"use server";

import type { Trip, Seat, Booking } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export const getTrips = async (): Promise<{ success: boolean; data: Trip[]; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { success: boolean; data: Trip[] };
        return {
            success: true,
            data: data?.data ?? [],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch trips';
        return {
            success: false,
            message,
            data: [],
        };
    }
};

export const getTrip = async (tripId: string): Promise<{ success: boolean; data: Trip | null; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/trips/${tripId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { success: boolean; data: Trip };
        return {
            success: true,
            data: data?.data ?? null,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch trip';
        return {
            success: false,
            message,
            data: null,
        };
    }
};

export const getSeats = async (tripId: string): Promise<{ success: boolean; data: Seat[]; trip?: Trip; message?: string }> => {
    try {
        let response = await fetch(`${API_BASE_URL}/trips/${tripId}/seats`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            response = await fetch(`${API_BASE_URL}/seats/${tripId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            });
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { success: boolean; seats?: Seat[]; data?: Seat[]; trip?: Trip };
        return {
            success: true,
            data: data?.seats || data?.data || [],
            trip: data?.trip,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch seats';
        return {
            success: false,
            message,
            data: [],
        };
    }
};

export const createBooking = async (bookingData: {
    tripId: string;
    seats: string[];
    name: string;
    phone: string;
}): Promise<{ success: boolean; status: number; data?: Booking; message?: string; errors?: unknown }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });

        const data = await response.json() as { success: boolean; data?: Booking; message?: string; errors?: unknown };

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data?.message || 'Failed to create booking',
                errors: data?.errors,
            };
        }

        return {
            success: true,
            status: response.status,
            data: data?.data,
            message: data?.message || 'Booking successful',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error occurred while booking';
        return {
            success: false,
            status: 500,
            message,
        };
    }
};

export const getBookings = async (phone?: string): Promise<{ success: boolean; data: Booking[]; message?: string }> => {
    try {
        const url = phone
            ? `${API_BASE_URL}/bookings?phone=${encodeURIComponent(phone.trim())}`
            : `${API_BASE_URL}/bookings`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { success: boolean; data?: Booking[] };
        return {
            success: true,
            data: data?.data ?? [],
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch bookings';
        return {
            success: false,
            message,
            data: [],
        };
    }
};

export const cancelBooking = async (bookingId: string): Promise<{ success: boolean; status: number; data?: Booking; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json() as { success: boolean; data?: Booking; message?: string };

        if (!response.ok) {
            return {
                success: false,
                status: response.status,
                message: data?.message || 'Failed to cancel booking',
            };
        }

        return {
            success: true,
            status: response.status,
            data: data?.data,
            message: data?.message || 'Booking cancelled successfully',
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error occurred while cancelling booking';
        return {
            success: false,
            status: 500,
            message,
        };
    }
};