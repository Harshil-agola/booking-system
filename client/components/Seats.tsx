"use client";

import React from "react";
import type { Seat } from "../types";

interface SeatsProps {
    seats: Seat[];
    selected: string[];
    onToggle: (label: string, isBooked: boolean) => void;
}

export const RenderSeats: React.FC<SeatsProps> = ({ seats = [], selected, onToggle }) => {
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <div className="w-full border border-black p-4 bg-white text-black">
            <div className="space-y-1.5">
                {rows.map((row) => {
                    const renderSeatBtn = (col: string) => {
                        const label = `${row}${col}`;
                        const seatDoc = seats.find((s) => s.row === row && s.column === col) || seats.find((s) => s.label === label);
                        const isBooked = Boolean(seatDoc && (seatDoc.status === "booked" || seatDoc.bookingId));
                        const isSelected = selected.includes(label);

                        let styleClass = "bg-white text-black border border-black hover:bg-neutral-100";
                        if (isBooked) {
                            styleClass = "bg-neutral-200 text-neutral-400 border border-neutral-300 cursor-not-allowed line-through";
                        } else if (isSelected) {
                            styleClass = "bg-black text-white border border-black font-bold";
                        }

                        return (
                            <button
                                key={label}
                                type="button"
                                disabled={isBooked}
                                onClick={() => onToggle(label, isBooked)}
                                title={isBooked ? `Seat ${label} (Booked)` : `Seat ${label}`}
                                className={`w-8 h-8 text-xs font-medium flex items-center justify-center transition-none ${styleClass}`}
                            >
                                {label}
                            </button>
                        );
                    };

                    return (
                        <div key={row} className="flex justify-between items-center px-1">
                            <div className="flex gap-2">
                                {renderSeatBtn("A")}
                                {renderSeatBtn("B")}
                            </div>
                            <div className="flex gap-2">
                                {renderSeatBtn("C")}
                                {renderSeatBtn("D")}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
