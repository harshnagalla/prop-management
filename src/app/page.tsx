"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  IndianRupee,
  FileText,
  PieChart,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Users,
  Globe,
  ChevronDown,
  Quote,
} from "lucide-react";


/* ─── Counter ─── */
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let s = 0;
        const step = (t: number) => { if (!s) s = t; const p = Math.min((t - s) / 2000, 1); setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end)); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step); obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ─── Reveal ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const features = [
    { icon: Building2, title: "Property Registry", desc: "Catalog all properties with value, area, ownership splits, stamp duty, and registration details.", color: "bg-blue-500" },
    { icon: IndianRupee, title: "Rental Income", desc: "Track rent by property. Auto-fill amounts. See who paid, who hasn't, and monthly trends.", color: "bg-emerald-500" },
    { icon: FileText, title: "AI Bill Scanner", desc: "Snap a photo of any Indian utility bill — UGVCL, AMC, Torrent Power. AI extracts everything.", color: "bg-violet-500" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Portfolio value, rental yields, income vs expenses charts, per-property ROI at a glance.", color: "bg-amber-500" },
    { icon: PieChart, title: "Smart Import", desc: "Drop your Excel sheet. We parse it instantly, detect multi-unit buildings, and import everything.", color: "bg-rose-500" },
    { icon: TrendingUp, title: "Sale & Profit Tracking", desc: "Mark properties sold. See profit/loss including stamp duty, registration, and all costs.", color: "bg-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ═══ Navbar ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 20 ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">BhoomiQ</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 hidden sm:block">
              Blog
            </Link>
            <Link href="/auth/sign-in" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 hidden sm:block">
              Sign In
            </Link>
            <Link href="/auth/sign-up" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-28 pb-0 md:pt-36 px-6 overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-100">
              <Sparkles size={12} /> AI-Powered Property Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Your family&apos;s property empire,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                one dashboard.
              </span>
            </h1>

            <Reveal delay={160}>
              <p className="text-lg text-slate-500 mt-6 max-w-2xl mx-auto leading-relaxed">
                Track 30+ properties across Ahmedabad — bills, rental income, documents, ROI, and ownership. AI scans your bills. Import from Excel in one click.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link href="/auth/sign-up" className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30">
                  Start Free <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a href="#features" className="inline-flex items-center justify-center gap-2 text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all">
                  See How It Works
                </a>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex items-center justify-center gap-5 mt-7 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Shield size={12} className="text-emerald-500" /> Secure</span>
                <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" /> AI-Powered</span>
                <span className="flex items-center gap-1"><Globe size={12} className="text-blue-500" /> Works on any device</span>
              </div>
            </Reveal>
          </div>

          {/* Dashboard Mockup */}
          <Reveal delay={350}>
            <div className="relative mt-12 -mb-24">
              {/* Browser chrome */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-200 overflow-hidden max-w-4xl mx-auto">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white border border-slate-200 rounded-lg px-4 py-1 text-xs text-slate-400 w-64 text-center">
                      app.bhoomiq.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-6 bg-gradient-to-b from-slate-50 to-white">
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Portfolio Value", value: "₹12.5 Cr", change: "+18.5%", color: "text-emerald-600", bg: "bg-blue-50" },
                      { label: "Monthly Rent", value: "₹4.2L", change: "+12%", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Properties", value: "32", change: "28 occupied", color: "text-blue-600", bg: "bg-violet-50" },
                      { label: "Avg Yield", value: "5.8%", change: "Above avg", color: "text-amber-600", bg: "bg-amber-50" },
                    ].map((s) => (
                      <div key={s.label} className={`${s.bg} rounded-xl p-3.5 border border-slate-100`}>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
                        <p className="text-lg font-extrabold text-slate-900 mt-0.5">{s.value}</p>
                        <p className={`text-[10px] font-semibold ${s.color} mt-0.5`}>{s.change}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-700">Income vs Expenses</p>
                      <p className="text-[10px] text-slate-400">Last 12 months</p>
                    </div>
                    <div className="flex items-end gap-[3px] h-24">
                      {[
                        { inc: 40, exp: 25 }, { inc: 55, exp: 30 }, { inc: 45, exp: 20 },
                        { inc: 60, exp: 35 }, { inc: 50, exp: 28 }, { inc: 70, exp: 32 },
                        { inc: 65, exp: 30 }, { inc: 80, exp: 38 }, { inc: 75, exp: 35 },
                        { inc: 85, exp: 40 }, { inc: 70, exp: 33 }, { inc: 95, exp: 42 },
                      ].map((d, i) => (
                        <div key={i} className="flex-1 flex gap-[1px]">
                          <div className="flex-1 rounded-t bg-gradient-to-t from-blue-400 to-blue-300 animate-[grow_1s_ease-out_forwards] opacity-0" style={{ height: `${d.inc}%`, animationDelay: `${i * 80 + 500}ms` }} />
                          <div className="flex-1 rounded-t bg-gradient-to-t from-rose-300 to-rose-200 animate-[grow_1s_ease-out_forwards] opacity-0" style={{ height: `${d.exp}%`, animationDelay: `${i * 80 + 600}ms` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <span key={m} className="text-[8px] text-slate-300 flex-1 text-center">{m}</span>)}
                    </div>
                  </div>

                  {/* Property rows */}
                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-700">Property Performance</p>
                    </div>
                    {[
                      { name: "Aarohi Royal", status: "Occupied", value: "₹12.2L", yield: "5.2%", color: "bg-emerald-100 text-emerald-700" },
                      { name: "Shivalik Shilp", status: "Occupied", value: "₹54.9L", yield: "6.1%", color: "bg-emerald-100 text-emerald-700" },
                      { name: "TRP - GF-35", status: "Vacant", value: "₹60.2L", yield: "—", color: "bg-slate-100 text-slate-600" },
                    ].map((p, i) => (
                      <div key={p.name} className={`flex items-center px-4 py-2.5 text-xs ${i < 2 ? "border-b border-slate-50" : ""}`}>
                        <span className="font-medium text-slate-800 w-32 truncate">{p.name}</span>
                        <span className={`${p.color} px-2 py-0.5 rounded-full text-[9px] font-semibold`}>{p.status}</span>
                        <span className="ml-auto text-slate-600 font-medium tabular-nums">{p.value}</span>
                        <span className="ml-6 text-slate-500 font-medium tabular-nums w-10 text-right">{p.yield}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -left-4 top-1/3 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 px-4 py-3 hidden lg:flex items-center gap-3 animate-[float_3s_ease-in-out_infinite]">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <IndianRupee size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Rent Received</p>
                  <p className="text-sm font-bold text-slate-900">₹4,20,000</p>
                </div>
              </div>

              <div className="absolute -right-4 top-1/4 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 px-4 py-3 hidden lg:flex items-center gap-3 animate-[float_3.5s_ease-in-out_infinite_0.5s]">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Sparkles size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">AI Scan</p>
                  <p className="text-sm font-bold text-emerald-600">Bill Detected ✓</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="pt-32 pb-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: "+", label: "Properties Managed", icon: Building2 },
              { value: 50, suffix: " Cr+", prefix: "₹", label: "Value Tracked", icon: TrendingUp },
              { value: 98, suffix: "%", label: "Uptime", icon: Shield },
              { value: 30, suffix: "+", label: "Families Trust Us", icon: Users },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
                    <s.icon size={20} className="text-blue-600" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    <Counter end={s.value} suffix={s.suffix} prefix={s.prefix} />
                  </p>
                  <p className="text-slate-400 text-sm mt-1">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="py-20 px-6 bg-slate-50/60">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Features</p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Everything your portfolio needs
              </h2>
              <p className="text-slate-500 mt-4">
                From Bodakdev flats to Narol industrial sheds — manage it all.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="group bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ How it works ═══ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Get started in 3 steps</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Import Properties", desc: "Drop your Excel sheet or add properties manually. We detect multi-unit buildings automatically.", icon: FileText },
              { step: "2", title: "Track Everything", desc: "Bills, income, documents, remarks — all organized per property with AI-powered bill scanning.", icon: BarChart3 },
              { step: "3", title: "See the Big Picture", desc: "Dashboard shows portfolio value, yields, trends, and per-property profitability at a glance.", icon: TrendingUp },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 100}>
                <div className="relative text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-5 text-white text-xl font-extrabold shadow-lg shadow-blue-500/20">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  {i < 2 && (
                    <ChevronRight size={20} className="hidden md:block absolute top-7 -right-5 text-slate-300" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Who is BhoomiQ for? ═══ */}
      <section className="py-20 px-6 bg-slate-50/60">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="text-center mb-8">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Who is BhoomiQ for?</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Built for Indian property families
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm">
              <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                BhoomiQ is designed for Indian families managing anywhere from 5 to 100+ properties.
                If you&apos;re tired of juggling Excel sheets, WhatsApp messages, and paper files to keep track
                of your portfolio, BhoomiQ is for you. Whether you own residential flats in Ahmedabad,
                commercial shops in Surat, or industrial sheds in Narol, our platform brings everything into
                one place. Track utility bills from UGVCL, AMC, and Torrent Power. Monitor rental income
                by tenant and property. Store all your property documents digitally. Our AI-powered bill
                scanner eliminates manual data entry, and the Excel import feature means you can migrate
                your existing records in minutes, not days. Stop guessing which properties are profitable
                and start making data-driven decisions about your family&apos;s real estate portfolio.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Trusted by property families
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "Finally replaced our Excel sheets. Now I can see which properties are making money and which aren't.",
                author: "Property Owner",
                location: "Ahmedabad",
              },
              {
                quote: "The AI bill scanner saves me hours. I just snap a photo of the UGVCL bill and it fills everything.",
                author: "Family Member",
                location: "",
              },
              {
                quote: "Importing our 30+ properties from the spreadsheet took 2 minutes. Everything mapped correctly.",
                author: "Portfolio Manager",
                location: "",
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-slate-50 rounded-2xl p-7 border border-slate-100 h-full flex flex-col">
                  <Quote size={24} className="text-blue-200 mb-4" />
                  <p className="text-slate-700 text-sm leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.author}{t.location ? `, ${t.location}` : ""}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-6 bg-slate-50/60">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Frequently asked questions
              </h2>
            </div>
          </Reveal>

          <div className="space-y-4">
            {[
              {
                q: "What is BhoomiQ?",
                a: "BhoomiQ is an AI-powered property portfolio management platform built for Indian families. It helps you track properties, utility bills, rental income, documents, and ROI from a single dashboard. Think of it as replacing your Excel sheets with something smarter.",
              },
              {
                q: "Is BhoomiQ free?",
                a: "Yes, BhoomiQ is free to get started. You can add properties, track bills and income, and use the analytics dashboard at no cost. We believe in building value first. Premium features for larger portfolios may be introduced in the future.",
              },
              {
                q: "What Indian utility bills does BhoomiQ support?",
                a: "Our AI bill scanner supports all major Indian utility providers including UGVCL, Torrent Power, AMC water and property tax bills, Adani Gas, and more. Simply upload a photo or PDF of any bill and our AI extracts the amount, date, meter reading, and other details automatically.",
              },
              {
                q: "Can I import from Excel?",
                a: "Absolutely. BhoomiQ has a smart Excel import feature that parses your existing property spreadsheets. It automatically detects multi-unit buildings, maps columns to the right fields, and imports everything in one click. Most users migrate their entire portfolio in under 5 minutes.",
              },
              {
                q: "Is my property data secure?",
                a: "Your data is stored on encrypted cloud infrastructure using Neon Postgres. We use Google OAuth and industry-standard authentication. All connections are HTTPS encrypted. Your property and financial data is never shared with third parties or used for advertising.",
              },
              {
                q: "How does AI bill scanning work?",
                a: "Upload a photo or PDF of any Indian utility bill. Our AI, powered by Google Gemini, reads the document and extracts key fields like billed amount, due date, consumption units, and meter readings. The extracted data pre-fills your bill entry form for quick review and saving.",
              },
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 60}>
                <details className="group bg-white rounded-xl border border-slate-100 shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left">
                    <span className="text-sm font-semibold text-slate-900 pr-4">{faq.q}</span>
                    <ChevronDown size={16} className="text-slate-400 shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-6">
        <Reveal>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready to take control of
                <br />your property portfolio?
              </h2>
              <p className="text-blue-100/80 text-lg mt-5 max-w-xl mx-auto">
                Join families across Ahmedabad who replaced their Excel sheets. Free to start, takes 15 minutes.
              </p>
              <Link href="/auth/sign-up" className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-base font-bold transition-all hover:shadow-2xl hover:scale-[1.02] mt-8">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-slate-100 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">BhoomiQ</span>
          </div>
          <p className="text-slate-400 text-sm">Built for Indian families managing property portfolios.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="/auth/sign-in" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-slate-900 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
