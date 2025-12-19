"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import EventForm from "../components/EventForm";

// Example recipients (could be fetched from API or state)
const recipientsList = [
    "sarah.j@email.com",
    "m.chen@email.com",
    "emily.r@email.com",
    "d.park@email.com",
    "jen.w@email.com",
];

export default function EventsPage() {
    const [events, setEvents] = useState([
        {
            id: 1,
            name: "Annual Fundraiser",
            date: "2025-02-15",
            description: "Our biggest fundraising event of the year!",
            notify: ["sarah.j@email.com", "m.chen@email.com"],
            image: null as string | null,
        },
    ]);
    const [showForm, setShowForm] = useState(false);

    function handleCreate(form: { name: string; date: string; description: string; notify: string[]; image?: string | null }) {
        setEvents([
            ...events,
            {
                id: events.length + 1,
                name: form.name,
                date: form.date,
                description: form.description,
                notify: form.notify,
                image: form.image ?? null,
            },
        ]);
        setShowForm(false);
        // Here you would also trigger your email notification logic
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar active="Events" />
            <main className="flex-1 min-h-screen ml-[260px]">
                <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
                    <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">Events</h1>
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-semibold">Upcoming Events</h2>
                        <button
                            className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
                            onClick={() => setShowForm(true)}
                        >
                            + Create Event
                        </button>
                    </div>
                    {showForm && (
                        <EventForm
                            onCreate={handleCreate}
                            onClose={() => setShowForm(false)}
                            recipients={recipientsList}
                        />
                    )}
                    <div className="grid gap-6 md:grid-cols-2">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm"
                            >
                                {event.image && (
                                    <img src={event.image} alt={event.name} className="mb-4 max-h-40 rounded w-full object-cover" />
                                )}
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-[#1C1917]">{event.name}</h3>
                                    <span className="text-xs text-[#64748B]">{event.date}</span>
                                </div>
                                <p className="mb-2 text-[#334155]">{event.description}</p>
                                <div className="text-sm text-[#64748B]">
                                    Notified: {event.notify.length > 0 ? event.notify.join(", ") : "None"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
