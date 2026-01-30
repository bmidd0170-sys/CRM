"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { isSuperAdmin, handleLogout, getAdminData } from "@/lib/admin-storage";

const safeguards = [
  {
    title: "Data Minimization",
    points: [
      "Only donor summary text and intent are sent to AI; no full PII payloads.",
      "Logs exclude prompts that contain emails, phone numbers, or payment details.",
      "No AI training on customer data; requests are single-turn only."
    ]
  },
  {
    title: "Access Control",
    points: [
      "AI tools gated to authenticated admins; audit trails kept via admin IDs on requests.",
      "Super Admins can disable AI per environment if policy requires.",
      "Rate limits protect against bulk export or prompt scraping."
    ]
  },
  {
    title: "Safety Guardrails",
    points: [
      "System prompts enforce respectful, fundraising-safe tone; block harmful outputs.",
      "Content filters reject toxic or disallowed categories before display.",
      "Outputs flagged for review when confidence is low or policy rules trigger."
    ]
  }
];

const promptPractices = [
  "Use role instructions (\"You are a nonprofit fundraising assistant\") to anchor behavior.",
  "Inject strict constraints: tone, word count, required disclosures, and do-not-mention items.",
  "Provide structured context (campaign goal, audience, desired CTA) to reduce drift.",
  "Ask for JSON-safe fields when the output is consumed programmatically.",
  "Include refusal guidance: if uncertain, return a safe fallback instead of inventing details."
];

const improvements = [
  "Faster donor outreach drafts with consistent tone and compliance language.",
  "Summarized donor intent from notes, cutting manual review time.",
  "Campaign idea generation that stays within policy wording and brand voice.",
  "Automatic redaction suggestions before storing AI-assisted notes."
];

export default function AIPolicyPage() {
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    setAllowed(isSuperAdmin());
    setChecked(true);
  }, []);

  useEffect(() => {
    const admin = getAdminData();
    if (admin) {
      setAdminName(admin.name);
    }
  }, []);

  if (!checked) {
    return (
      <div className="flex min-h-screen bg-[#0F172A] text-white items-center justify-center">
        <div className="animate-pulse text-lg">Loading access…</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen bg-[#0F172A] text-white items-center justify-center px-6 text-center">
        <div>
          <p className="text-2xl font-semibold mb-2">Access restricted</p>
          <p className="text-sm text-white/80">This page is available only to Super Admins. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar active="AI Policy" />
      <main className="flex-1 min-h-screen ml-[260px]">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-5 flex justify-between items-center sticky top-0 z-40 animate-slideInDown">
          <h1 className="font-bricolage text-2xl font-bold text-[#1C1917]">AI Policy & Safeguards</h1>
          <div className="flex items-center gap-6">
            <span className="text-[#1C1917] font-semibold">{adminName || "Loading..."}</span>
            <button onClick={handleLogout} className="bg-[#0F766E] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#0D5B54] transition">Logout</button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white rounded-2xl p-8 shadow-md">
            <p className="uppercase tracking-[0.2em] text-xs mb-2 font-semibold">AI-powered feature inside DonorConnect (TS.6.2 - TS.6.3)</p>
            <h2 className="text-3xl font-bold mb-4">How we use AI responsibly</h2>
            <p className="text-white/90 leading-relaxed max-w-3xl">AI is used to draft donor outreach, summarize donor notes, and suggest campaign copy. Human review is required before sending. Models never receive full donor PII or payment data.</p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm uppercase tracking-[0.08em] text-white/70 mb-1">AI API</p>
                <p className="text-lg font-semibold">OpenAI Chat Completions</p>
                <p className="text-xs text-white/80">Server-side calls with admin scoping and rate limits.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm uppercase tracking-[0.08em] text-white/70 mb-1">Model</p>
                <p className="text-lg font-semibold">GPT-4o mini (latest)</p>
                <p className="text-xs text-white/80">Chosen for latency, cost control, and strong safety filters.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="text-sm uppercase tracking-[0.08em] text-white/70 mb-1">Policy</p>
                <p className="text-lg font-semibold">AI Policy Page</p>
                <p className="text-xs text-white/80">Documented safeguards, usage boundaries, and escalation paths.</p>
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-3 gap-6">
            {safeguards.map(card => (
              <div key={card.title} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">{card.title}</h3>
                <ul className="space-y-2 text-sm text-[#334155]">
                  {card.points.map(point => (
                    <li key={point} className="flex gap-2">
                      <span>•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-[#0F766E] font-semibold">Prompt Crafting</p>
                <h3 className="text-xl font-bold text-[#0F172A]">How we craft prompts to get reliable results</h3>
              </div>
              <span className="bg-[#ECFEFF] text-[#0F766E] px-3 py-1 rounded-full text-xs font-semibold border border-[#0F766E]/20">Human-in-the-loop required</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {promptPractices.map(item => (
                <div key={item} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 text-sm text-[#334155]">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-[#0F766E] font-semibold">Impact</p>
                <h3 className="text-xl font-bold text-[#0F172A]">How AI improves DonorConnect</h3>
              </div>
              <span className="bg-[#F0FDF4] text-[#15803D] px-3 py-1 rounded-full text-xs font-semibold border border-[#15803D]/20">Faster + safer workflows</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {improvements.map(item => (
                <div key={item} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 text-sm text-[#334155]">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0F172A] text-white rounded-2xl p-6 border border-[#1E293B] shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.14em] text-[#38BDF8] font-semibold">Operational Notes</p>
                <h3 className="text-xl font-bold">Admin controls & escalation</h3>
                <p className="text-white/80 text-sm mt-2 max-w-3xl">Super Admins can disable AI endpoints, rotate API keys, and review flagged generations. Any incident follows the documented security runbook with time-bound remediation and donor communication steps.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
