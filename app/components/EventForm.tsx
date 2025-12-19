"use client";
import React, { useState } from "react";

interface EventFormProps {
    onCreate: (data: {
        name: string;
        date: string;
        description: string;
        notify: string[];
        image?: string | null;
    }) => void;
    onClose: () => void;
    recipients: string[];
}

export default function EventForm({ onCreate, onClose, recipients }: EventFormProps) {
    const [form, setForm] = useState({
        name: "",
        date: "",
        description: "",
        notify: [] as string[],
        image: null as string | null,
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    function handleNotifyChange(email: string) {
        setForm((prev) => ({
            ...prev,
            notify: prev.notify.includes(email)
                ? prev.notify.filter((e) => e !== email)
                : [...prev.notify, email],
        }));
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm((prev) => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!form.name || !form.date) return;
        onCreate(form);
        setForm({ name: "", date: "", description: "", notify: [], image: null });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4 text-[#1C1917]">Create New Event</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917] bg-white placeholder-[#57534E]"
                        placeholder="Event Name"
                        required
                    />
                    <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917] bg-white"
                        required
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        className="border rounded px-3 py-2 text-sm text-[#1C1917] bg-white placeholder-[#57534E]"
                        placeholder="Description (optional)"
                    />
                    <div>
                        <label className="block font-medium mb-2 text-[#1C1917]">Event Image:</label>
                        <label htmlFor="event-image-upload" className="inline-block bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition cursor-pointer mb-2">
                            Choose Image
                        </label>
                        <input
                            id="event-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        {form.image && (
                            <img src={form.image} alt="Preview" className="max-h-32 mb-2 rounded" />
                        )}
                    </div>
                    <div>
                        <label className="block font-medium mb-2 text-[#1C1917]">Notify Recipients:</label>
                        <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                            {recipients.map((email) => (
                                <label key={email} className="flex items-center gap-2 text-[#1C1917]">
                                    <input
                                        type="checkbox"
                                        checked={form.notify.includes(email)}
                                        onChange={() => handleNotifyChange(email)}
                                    />
                                    <span className="text-[#1C1917]">{email}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition"
                    >
                        Create Event
                    </button>
                </form>
            </div>
        </div>
    );
}
