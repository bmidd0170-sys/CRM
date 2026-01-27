"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import EventForm from "./components/EventForm";
import { canDelete, canCreate, canEdit, getAdminId } from "@/lib/admin-storage";

// Example recipients (could be fetched from API or state)
const recipientsList = [
    "sarah.j@email.com",
    "m.chen@email.com",
    "emily.r@email.com",
    "d.park@email.com",
    "jen.w@email.com",
];

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any | null>(null);
    const [canDeleteEvents, setCanDeleteEvents] = useState(false);
    const [canCreateEvents, setCanCreateEvents] = useState(false);
    const [canEditEvents, setCanEditEvents] = useState(false);

    useEffect(() => {
        setCanDeleteEvents(canDelete('events'));
        setCanCreateEvents(canCreate('events'));
        setCanEditEvents(canEdit('events'));
    }, []);

    // Fetch events from API
    function fetchEvents() {
        fetch("/api/events")
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(error => console.error('Error fetching events:', error));
    }

    useEffect(() => {
        fetchEvents();
    }, []);

    async function handleCreate(form: { name: string; date: string; description: string; image?: string | null; campaignId?: number | null }) {
        try {
            const dateIso = new Date(form.date).toISOString();

            const payload = {
                name: form.name,
                date: dateIso,
                description: form.description,
                image: form.image && form.image.trim() ? form.image : null,
                campaignId: form.campaignId || null,
            };

            const adminId = getAdminId();
            const method = editingEvent ? 'PUT' : 'POST';
            const body = editingEvent 
                ? { ...payload, id: editingEvent.id }
                : payload;

            const res = await fetch("/api/events", {
                method,
                headers: { 
                    "Content-Type": "application/json",
                    'x-admin-id': adminId?.toString() || ''
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => null);
                const message = err?.details
                    ? Array.isArray(err.details)
                        ? err.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
                        : err.details
                    : err?.error || 'Failed to save event';
                throw new Error(message);
            }

            setShowForm(false);
            setEditingEvent(null);
            fetchEvents();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
            console.error('Error saving event:', error);
        }
    }

    function handleEditClick(event: any, evt: React.MouseEvent) {
        evt.stopPropagation();
        setEditingEvent(event);
        setShowForm(true);
    }

    function handleDelete(eventId: number, event: React.MouseEvent) {
        event.stopPropagation();
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }

        const adminId = getAdminId();
        fetch(`/api/events?id=${eventId}`, {
            method: 'DELETE',
            headers: {
                'x-admin-id': adminId?.toString() || ''
            }
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => {
                        throw new Error(err.error || 'Failed to delete event');
                    });
                }
                return res.json();
            })
            .then(() => {
                fetchEvents(); // Refresh the list
            })
            .catch(error => {
                alert(`Error: ${error.message}`);
                console.error('Error deleting event:', error);
            });
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
                        {canCreateEvents && (
                            <button
                                className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
                                onClick={() => setShowForm(true)}
                            >
                                + Create Event
                            </button>
                        )}
                    </div>
                    {showForm && (
                        <EventForm
                            onCreate={handleCreate}
                            onClose={() => {
                                setShowForm(false);
                                setEditingEvent(null);
                            }}
                            recipients={recipientsList}
                            event={editingEvent}
                        />
                    )}
                    <div className="grid gap-6 md:grid-cols-2">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="bg-white border border-[#E2E8F0] rounded-lg p-6 shadow-sm relative"
                            >
                                {canDeleteEvents && (
                                    <button
                                        onClick={(e) => handleDelete(event.id, e)}
                                        className="absolute top-4 right-16 bg-rose-500 text-white px-3 py-1 rounded-md text-xs hover:bg-rose-600 transition"
                                        title="Delete Event"
                                    >
                                        Delete
                                    </button>
                                )}
                                {canEditEvents && (
                                    <button
                                        onClick={(e) => handleEditClick(event, e)}
                                        className="absolute top-4 right-4 bg-[#0F766E] text-white px-3 py-1 rounded-md text-xs hover:bg-[#0D5B54] transition"
                                        title="Edit Event"
                                    >
                                        Edit
                                    </button>
                                )}
                                {event.image && (
                                    <img src={event.image} alt={event.name} className="mb-4 max-h-40 rounded w-full object-cover" />
                                )}
                                <h3 className="text-lg font-bold text-[#1C1917] mb-2">{event.name}</h3>
                                <p className="mb-3 text-[#334155]">{event.description}</p>
                                <span className="text-sm font-semibold text-[#0F766E] block mb-3">
                                    {new Date(event.date).toLocaleDateString()}
                                </span>
                                {event.campaign && (
                                    <div className="text-sm text-[#64748B]">
                                        Campaign: {event.campaign.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
