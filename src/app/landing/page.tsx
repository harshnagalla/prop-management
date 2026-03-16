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
  ChevronDown,
} from "lucide-react";

/* ─── Animated counter ─── */
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const duration = 2000;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

/* ─── 3D tilt card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}

/* ─── Scroll reveal ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Feature card with flip ─── */
function FeatureCard({ icon: Icon, title, description, color }: {
  icon: typeof Building2;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group [perspective:1000px]">
      <div className="relative transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 [backface-visibility:hidden]">
          <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-5`}>
            <Icon size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center">
          <div className="text-center">
            <Icon size={40} className="text-white/80 mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">{title}</p>
            <p className="text-slate-300 text-sm mt-2">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main landing page ─── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ═══ Navbar ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">PropManager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Gradient orbs */}
        <div
          className="absolute top-20 -left-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-40 -right-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-300/10 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.05}px)` }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-100">
                  <Zap size={12} />
                  AI-Powered Property Intelligence
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight">
                  Your family&apos;s
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    property empire,
                  </span>
                  <br />
                  one dashboard.
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="text-lg text-slate-500 mt-6 max-w-lg leading-relaxed">
                  Stop juggling Excel sheets. Track 30+ properties across Ahmedabad — bills, rental income, documents, and ROI — all in one place. AI scans your bills automatically.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link
                    href="/auth/sign-up"
                    className="group inline-flex items-center justify-center gap-2 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-4 rounded-full text-base font-semibold transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]"
                  >
                    Start Free
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-2 text-slate-700 bg-white border border-slate-200 hover:border-slate-300 px-8 py-4 rounded-full text-base font-semibold transition-all hover:shadow-lg"
                  >
                    See Features
                    <ChevronDown size={18} />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="flex items-center gap-6 mt-10 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Shield size={14} className="text-green-500" /> Bank-grade security
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" /> AI-powered
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Right: Floating property card */}
            <Reveal delay={300}>
              <div className="relative hidden lg:block">
                <TiltCard>
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Portfolio Value</p>
                        <p className="text-4xl font-extrabold text-slate-900 mt-1">₹12.5 Cr</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <TrendingUp size={20} className="text-white" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-8">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">+18.5% this year</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Properties", value: "32", icon: Building2, color: "from-blue-500 to-indigo-500" },
                        { label: "Occupied", value: "28", icon: Shield, color: "from-emerald-500 to-green-500" },
                        { label: "Monthly Rent", value: "₹4.2L", icon: IndianRupee, color: "from-amber-500 to-orange-500" },
                      ].map((stat) => (
                        <div key={stat.label} className="text-center">
                          <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                            <stat.icon size={16} className="text-white" />
                          </div>
                          <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Mini chart bars */}
                    <div className="mt-8 flex items-end gap-1.5 h-16">
                      {[40, 55, 35, 70, 50, 80, 65, 90, 75, 85, 60, 95].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-blue-500 to-indigo-400 opacity-80"
                          style={{
                            height: `${h}%`,
                            animationDelay: `${i * 100}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[10px] text-slate-300">Jan</span>
                      <span className="text-[10px] text-slate-300">Dec</span>
                    </div>
                  </div>
                </TiltCard>

                {/* Floating glassmorphism badge */}
                <div
                  className="absolute -bottom-6 -left-6 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 px-5 py-3 flex items-center gap-3"
                  style={{ transform: `translateY(${scrollY * -0.06}px)` }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <IndianRupee size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rent Received</p>
                    <p className="text-sm font-bold text-slate-900">₹4,20,000</p>
                  </div>
                </div>

                {/* Floating glassmorphism badge top-right */}
                <div
                  className="absolute -top-4 -right-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 px-5 py-3"
                  style={{ transform: `translateY(${scrollY * 0.04}px)` }}
                >
                  <p className="text-xs text-slate-500">AI Scan</p>
                  <p className="text-sm font-bold text-emerald-600">Bill Detected ✓</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: "+", label: "Properties Managed" },
              { value: 50, suffix: " Cr+", prefix: "₹", label: "Portfolio Value Tracked" },
              { value: 98, suffix: "%", label: "Uptime Reliability" },
              { value: 15, suffix: " Min", label: "Avg. Setup Time" },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-extrabold text-white">
                    <Counter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                  </p>
                  <p className="text-slate-400 text-sm mt-2">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="py-24 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Everything your family portfolio needs
              </h2>
              <p className="text-slate-500 mt-4 text-lg">
                From Bodakdev flats to Narol industrial sheds — manage it all.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Property Registry", description: "Catalog all properties with purchase price, current value, type, area, and ownership splits.", color: "bg-blue-600" },
              { icon: IndianRupee, title: "Rental Income", description: "Track rent payments by property and month. Auto-fill from property data. See who paid and who hasn't.", color: "bg-emerald-600" },
              { icon: FileText, title: "AI Bill Scanner", description: "Snap a photo of any Indian utility bill. AI extracts amount, date, vendor — even reads UGVCL and AMC formats.", color: "bg-violet-600" },
              { icon: BarChart3, title: "Dashboard Analytics", description: "Portfolio value, rental yields, income vs expenses charts, and per-property ROI — all at a glance.", color: "bg-amber-600" },
              { icon: PieChart, title: "Expense Breakdown", description: "See where money goes — electricity, water, municipal tax, maintenance — broken down by category.", color: "bg-rose-600" },
              { icon: TrendingUp, title: "Sale & Profit Tracking", description: "Mark properties as sold. See profit/loss including stamp duty and registration charges.", color: "bg-cyan-600" },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 80}>
                <FeatureCard {...feature} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />

        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Your properties deserve
              <br />
              <span className="text-blue-200">better management.</span>
            </h2>
            <p className="text-blue-100/80 text-lg mt-6 max-w-xl mx-auto">
              Join families across Ahmedabad who replaced their Excel sheets with PropManager. Free to start, takes 15 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                href="/auth/sign-up"
                className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-full text-base font-bold transition-all hover:shadow-2xl hover:scale-[1.02]"
              >
                Get Started Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="text-white font-bold">PropManager</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built for Indian families managing property portfolios.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
