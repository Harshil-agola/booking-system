import { Suspense } from "react";
import { getSeats, getTrip, getTrips } from "@/actions/bookings.action";
import TripPageView from "@/components/TripPageView";

async function TripContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [seatsResponse, tripResponse, tripsResponse] = await Promise.all([
    getSeats(id),
    getTrip(id),
    getTrips(),
  ]);

  const trip = tripResponse?.data || undefined;
  const allTrips = tripsResponse?.data ?? [];

  return (
    <TripPageView
      id={id}
      seats={seatsResponse?.data ?? []}
      trip={trip}
      allTrips={allTrips}
    />
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-black text-sm">
          Loading trip...
        </div>
      }
    >
      <TripContent params={params} />
    </Suspense>
  );
}