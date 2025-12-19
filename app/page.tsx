"use client";
import React from "react";

import LoginOverlay from "./components/LoginOverlay";

type FeatureCardProps = {
  icon: string;
  title: string;
  desc: string;
};

type StepCardProps = {
  number: number;
  title: string;
  desc: string;
};

export default function Home() {
  const [showLogin, setShowLogin] = React.useState(false);

  return (
    <>
      <main
        className={`bg-[#FAFAF9] text-[#1C1917] min-h-screen transition-all duration-300 ${showLogin ? 'opacity-40' : ''}`}
      >
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 border-b border-[#E7E5E4] backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-8 flex justify-between items-center py-5">
            <a href="#" className="font-bricolage text-2xl font-bold text-[#0F766E]">DonorConnect</a>
            <div className="flex gap-10 items-center">
              <a href="#features" className="text-[#57534E] font-medium hover:text-[#0F766E] transition">Features</a>
              <a href="#how-it-works" className="text-[#57534E] font-medium hover:text-[#0F766E] transition">How It Works</a>
              <button
                className="bg-[#0F766E] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0D5B54] transition shadow-sm"
                onClick={() => setShowLogin(true)}
              >
                Register
              </button>
            </div>
          </div>
        </nav>
        {/* Navigation */}

        {/* Hero Section */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-white to-[#F0FDFA]">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <h1 className="font-bricolage text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fadeInUp">Streamline Your Donor Management</h1>
            <p className="text-xl md:text-2xl text-[#57534E] max-w-2xl mx-auto mb-10 animate-fadeInUp opacity-80">A complete CRM built for nonprofits. Track donations, manage donor relationships, and grow your impact with tools designed specifically for your mission.</p>
            <a href="#" className="inline-block bg-[#0F766E] text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-[#0D5B54] transition animate-fadeInUp">Get Started Today</a>
          </div>
        </section>

        {/* Features Section */}
        <section className="features py-20 bg-white" id="features">
          <div className="max-w-6xl mx-auto px-8">
            <h2 className="font-bricolage text-4xl font-bold text-center mb-14 text-[#1C1917]">Everything You Need in One Place</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <FeatureCard icon="📊" title="Data Organization" desc="Store and organize all your donor information in one secure, easy-to-access location. Keep detailed records of donations, contact info, and engagement history." />
              <FeatureCard icon="💬" title="Easy Communication" desc="Send personalized emails, thank you notes, and updates directly through the platform. Build stronger relationships with automated communication tools." />
              <FeatureCard icon="📈" title="Insightful Analytics" desc="Get real-time insights into donation trends, donor behavior, and campaign performance. Make data-driven decisions to maximize your fundraising impact." />
              <FeatureCard icon="🎯" title="Campaign Tracking" desc="Monitor all your fundraising campaigns in one dashboard. Track goals, measure progress, and identify your most successful initiatives." />
              <FeatureCard icon="🔔" title="Smart Reminders" desc="Never miss a follow-up opportunity. Get automated reminders for donor anniversaries, scheduled communications, and important milestones." />
              <FeatureCard icon="📝" title="Custom Reports" desc="Generate detailed reports tailored to your needs. Share progress with your board, team, or donors with professional, customizable reports." />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-[#FAFAF9]" id="how-it-works">
          <div className="max-w-3xl mx-auto px-8">
            <h2 className="font-bricolage text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid gap-10 mt-8">
              <StepCard number={1} title="Register Your Organization" desc="Sign up in minutes with basic information about your nonprofit. No credit card required to get started." />
              <StepCard number={2} title="Import Your Data" desc="Easily upload your existing donor database or start fresh. Our system guides you through the setup process step by step." />
              <StepCard number={3} title="Start Growing Your Impact" desc="Begin tracking donations, communicating with donors, and analyzing your fundraising performance. Our support team is here to help every step of the way." />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#0F766E] to-[#0D5B54] text-white text-center">
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="font-bricolage text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Donor Management?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-95">Join hundreds of nonprofits already using DonorConnect to build stronger relationships and increase their impact.</p>
            <a href="#" className="inline-block bg-white text-[#0F766E] px-10 py-4 rounded-xl font-semibold text-lg shadow-lg hover:scale-105 transition">Start Your Free Trial</a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#1C1917] text-[#78716C] py-12 text-center">
          <div className="max-w-6xl mx-auto px-8">
            <p className="text-sm">&copy; 2024 DonorConnect. Making nonprofit management easier.</p>
          </div>
        </footer>
      </main>
      <LoginOverlay show={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-[#FAFAF9] border border-[#E7E5E4] rounded-2xl p-8 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#0F766E] to-[#14B8A6] text-3xl mb-6">{icon}</div>
      <h3 className="font-bricolage text-xl font-semibold mb-2 text-[#1C1917]">{title}</h3>
      <p className="text-[#57534E] text-base leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc }: StepCardProps) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-12 h-12 bg-[#0F766E] text-white rounded-full flex items-center justify-center font-bricolage text-lg font-bold">{number}</div>
      <div>
        <h3 className="font-bricolage text-lg font-semibold mb-1 text-[#1C1917]">{title}</h3>
        <p className="text-[#57534E] text-base leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

