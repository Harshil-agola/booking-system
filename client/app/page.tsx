import { Suspense } from "react";
import Link from "next/link";
import { getTrips } from "@/actions/bookings.action";
import { MyBookings } from "@/components/MyBookings";
import type { Trip } from "@/types";


async function TripsList() {
  const tripsRes = await getTrips();
  const trips: Trip[] = tripsRes?.data ?? [];

  if (trips.length === 0) {
    return (
      <div className="border border-black p-4 text-xs text-neutral-600">
        No trips available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {trips.map((trip) => (
        <Link
          key={trip._id}
          href={`/trips/${trip._id}`}
          className="block border border-black p-3 hover:bg-neutral-100 transition-none"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-sm">
                {trip.startLocation} to {trip.endLocation}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">Rs {trip.pricePerSeat}</p>
              <span className="inline-block text-xs font-semibold underline mt-0.5">
                View Seats
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider">Available Trips</h2>
          <Suspense
            fallback={
              <div className="border border-black p-4 text-xs text-neutral-600">
                Loading available trips...
              </div>
            }
          >
            <TripsList />
          </Suspense>
        </section>

        <section className="pt-2">
          <MyBookings />
        </section>
      </div>
    </main>
  );
}
