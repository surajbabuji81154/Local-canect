import React, { useState } from 'react';
import { ShieldCheck, Mail, Send, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface StaticPageProps {
  type: 'about' | 'terms' | 'privacy' | 'community-guidelines' | 'contact';
  onBack: () => void;
}

export const StaticPages: React.FC<StaticPageProps> = ({ type, onBack }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Platform</span>
      </button>

      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 space-y-8 text-stone-200">
        {/* About Page */}
        {type === 'about' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                About LocalConnect
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                Connecting Consenting Adults in Local Communities
              </h1>
              <p className="text-stone-400 text-sm leading-relaxed">
                LocalConnect was founded to offer a modern, privacy-focused dating and social discovery experience tailored for adults in India's leading metropolitan centers.
              </p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-stone-300">
              <h3 className="text-base font-bold text-white">Our Mission</h3>
              <p>
                We believe in genuine connections without superficial algorithmic traps. By prioritizing local proximity at the city level and enforcing strict 18+ age verification, LocalConnect creates an authentic and secure space for singles to discover companions, chat in real-time, and plan memorable real-world dates.
              </p>

              <h3 className="text-base font-bold text-white">Privacy First Architecture</h3>
              <p>
                Unlike generic social apps, LocalConnect never reveals your phone number, email address, or exact geographic home coordinates. You remain completely in control of what you share and who you message.
              </p>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 flex items-start gap-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-stone-400">
                  <strong className="text-white">Strict Adult Standards: </strong>
                  “This platform is strictly for adults aged 18 and above. Harassment, fraud, impersonation, exploitation, solicitation of sexual services, illegal activity and abusive behavior are prohibited.”
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms of Service */}
        {type === 'terms' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                Legal & Governance
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                Terms & Conditions
              </h1>
              <p className="text-xs text-stone-400">Effective Date: 2026</p>
            </div>

            <div className="space-y-5 text-xs text-stone-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">1. Eligibility (Strictly 18+)</h3>
                <p>
                  You must be at least 18 years of age to create an account on LocalConnect or use any of our dating, messaging, or subscription features. By signing up, you explicitly affirm and warrant that you are 18 years of age or older. Accounts belonging to minors or suspected underage users are terminated immediately without refund.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">2. Prohibited Conduct</h3>
                <p className="p-3 bg-stone-950 rounded-xl border border-rose-500/30 text-rose-200">
                  “This platform is strictly for adults aged 18 and above. Harassment, fraud, impersonation, exploitation, solicitation of sexual services, illegal activity and abusive behavior are prohibited.”
                </p>
                <p>
                  Users may not engage in extortion, solicit commercial escort or prostitution services, send unsolicited sexually explicit imagery, distribute harmful links, or harvest personal data.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">3. Paid Subscriptions & Razorpay</h3>
                <p>
                  LocalConnect provides optional VIP memberships for enhanced discovery and communication perks. All payments are processed through encrypted payment gateways (Razorpay) and subject to server-side cryptographic verification. Subscription fees are non-refundable once access has been activated.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">4. Account Moderation & Termination</h3>
                <p>
                  LocalConnect administration reserves the right to suspend or permanently block any account found in breach of our Community Guidelines or applicable laws.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        {type === 'privacy' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                Data Protection
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-stone-400">Your privacy is fundamental to our service.</p>
            </div>

            <div className="space-y-5 text-xs text-stone-300 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Display Name, age, and broad city location selected at registration.</li>
                  <li>Profile photos and voluntary bio/interest tags.</li>
                  <li>Account email address and securely hashed authentication credentials.</li>
                  <li>Direct messages sent on the platform (stored securely with end-to-recipient access).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">2. What We Never Disclose</h3>
                <p>
                  LocalConnect does <strong>not</strong> display your phone number, email address, or exact residential address on public profile cards. Other users only see your city and chosen display details.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-white">3. Right to Complete Deletion</h3>
                <p>
                  You hold the absolute right to purge your account. Clicking "Delete My Account" in your profile immediately deletes your records, conversations, and uploaded content from our databases.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* Community Guidelines */}
        {type === 'community-guidelines' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                Safety & Respect
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                Community Guidelines
              </h1>
              <p className="text-xs text-stone-400">
                Standards that keep LocalConnect respectful, safe, and enjoyable.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-2xl border border-rose-500/40 text-xs text-rose-200">
              “This platform is strictly for adults aged 18 and above. Harassment, fraud, impersonation, exploitation, solicitation of sexual services, illegal activity and abusive behavior are prohibited.”
            </div>

            <div className="space-y-4 text-xs text-stone-300 leading-relaxed">
              <div>
                <h3 className="font-bold text-white text-sm">1. Respect Boundaries</h3>
                <p>Every member has the right to decide who they converse with. If someone unmatches, blocks, or asks you not to message, respect their choice.</p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">2. Zero Tolerance for Scams or Financial Requests</h3>
                <p>Never request money, gift cards, UPI transfers, or investments from anyone you meet on LocalConnect. Any user attempting financial fraud will be permanently banned and reported.</p>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">3. Authentic Profiles</h3>
                <p>Do not impersonate other people or use celebrity photographs. Use real, consenting photos of yourself.</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Support */}
        {type === 'contact' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">
                Support & Inquiries
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                Contact LocalConnect Support
              </h1>
              <p className="text-xs text-stone-400">
                Our support team is available 24/7 for safety, account, and billing queries.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="p-8 text-center bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Message Dispatched</h3>
                <p className="text-xs text-stone-400">
                  Thank you for reaching out. A support representative will respond to your registered email within 12 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Subject / Concern
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Account Question, Billing Inquiry, Safety Concern"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your issue or feedback in detail..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Support Request</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
