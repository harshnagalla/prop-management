"use client";

import { useEffect, useRef, useState, Suspense, lazy } from "react";
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
} from "lucide-react";

const Scene3D = lazy(() => import("@/components/landing/scene-3d"));

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
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-100">
                <Sparkles size={12} /> AI-Powered Property Intelligence
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tight">
                Your family&apos;s property empire,{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  one dashboard.
                </span>
              </h1>
            </Reveal>

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

          {/* 3D Scene */}
          <Reveal delay={350}>
            <div className="relative h-[380px] md:h-[480px] mt-10 -mb-20 rounded-3xl overflow-hidden">
              <Suspense fallback={
                <div className="w-full h-full bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center rounded-3xl">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              }>
                <Scene3D />
              </Suspense>
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
            <Link href="/auth/sign-in" className="hover:text-slate-900 transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-slate-900 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
