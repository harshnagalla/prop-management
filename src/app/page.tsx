"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
} from "lucide-react";

/* ─── Animated counter ─── */
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = (t: number) => {
          if (!start) start = t;
          const p = Math.min((t - start) / 2000, 1);
          setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

/* ─── Scroll reveal ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${v ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Animated skyline ─── */
function AnimatedSkyline() {
  const buildings = [
    { w: 60, h: 180, x: 0, color: "from-blue-500 to-blue-600", delay: 0, windows: 6 },
    { w: 45, h: 240, x: 70, color: "from-indigo-500 to-indigo-600", delay: 150, windows: 8 },
    { w: 55, h: 160, x: 125, color: "from-violet-500 to-violet-600", delay: 300, windows: 5 },
    { w: 70, h: 280, x: 190, color: "from-blue-600 to-indigo-700", delay: 100, windows: 10 },
    { w: 50, h: 200, x: 270, color: "from-indigo-400 to-blue-500", delay: 250, windows: 7 },
    { w: 40, h: 140, x: 330, color: "from-violet-400 to-purple-500", delay: 400, windows: 4 },
    { w: 65, h: 260, x: 380, color: "from-blue-500 to-indigo-600", delay: 200, windows: 9 },
    { w: 48, h: 190, x: 455, color: "from-indigo-500 to-violet-600", delay: 350, windows: 6 },
    { w: 55, h: 220, x: 513, color: "from-blue-400 to-blue-500", delay: 150, windows: 7 },
    { w: 42, h: 170, x: 578, color: "from-violet-500 to-indigo-500", delay: 300, windows: 5 },
  ];

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[640px] h-[300px]">
      {buildings.map((b, i) => (
        <div
          key={i}
          className="absolute bottom-0 animate-building-rise"
          style={{
            left: b.x,
            width: b.w,
            height: b.h,
            animationDelay: `${b.delay}ms`,
          }}
        >
          <div className={`w-full h-full bg-gradient-to-t ${b.color} rounded-t-lg relative overflow-hidden`}>
            {/* Windows */}
            <div className="absolute inset-2 grid grid-cols-2 gap-1.5 content-start pt-2">
              {Array.from({ length: b.windows }).map((_, j) => (
                <div
                  key={j}
                  className="w-full h-3 rounded-sm animate-window-glow"
                  style={{
                    animationDelay: `${b.delay + j * 200 + 800}ms`,
                    backgroundColor: "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-building-shine" />
          </div>
        </div>
      ))}
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 rounded-full" />
    </div>
  );
}

/* ─── Floating particles ─── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Tilt card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = useCallback((e: React.MouseEvent) => {
    const c = ref.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -10;
    const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 10;
    c.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.04,1.04,1.04)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)";
  }, []);
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={`transition-transform duration-200 ${className}`} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}

/* ─── Glowing feature card ─── */
function GlowCard({ icon: Icon, title, desc, gradient }: { icon: typeof Building2; title: string; desc: string; gradient: string }) {
  return (
    <TiltCard>
      <div className={`group relative rounded-2xl p-[1px] bg-gradient-to-br ${gradient} overflow-hidden`}>
        <div className="bg-slate-950/90 backdrop-blur-xl rounded-2xl p-7 h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={22} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </div>
      </div>
    </TiltCard>
  );
}

/* ─── Main ─── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("mousemove", onMouse); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* ═══ CSS Animations ═══ */}
      <style jsx>{`
        @keyframes building-rise { 0% { transform: scaleY(0); opacity: 0; } 100% { transform: scaleY(1); opacity: 1; } }
        @keyframes window-glow { 0%,100% { background-color: rgba(255,255,255,0.08); } 50% { background-color: rgba(255,200,50,0.6); } }
        @keyframes building-shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        @keyframes float-particle { 0%,100% { transform: translateY(0) scale(1); opacity: 0.3; } 50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes text-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-building-rise { animation: building-rise 0.8s ease-out forwards; transform-origin: bottom; transform: scaleY(0); }
        .animate-window-glow { animation: window-glow 3s ease-in-out infinite; }
        .animate-building-shine { animation: building-shine 3s ease-in-out infinite; }
        .animate-float-particle { animation: float-particle ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 3s ease infinite; }
        .animate-shimmer { background-size: 400% 100%; animation: text-shimmer 3s linear infinite; }
      `}</style>

      {/* ═══ Navbar ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center animate-pulse-glow">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">BhoomiQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in" className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/auth/sign-up" className="text-sm font-medium bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-400 hover:to-violet-500 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 hover:scale-105">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-6">
        <Particles />

        {/* Moving gradient orbs following mouse */}
        <div className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] transition-all duration-1000 ease-out" style={{ left: mousePos.x * 0.05, top: mousePos.y * 0.05 }} />
        <div className="absolute w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] transition-all duration-1000 ease-out" style={{ right: mousePos.x * 0.03, bottom: mousePos.y * 0.03 }} />
        <div className="absolute w-[300px] h-[300px] bg-indigo-500/15 rounded-full blur-[80px] top-1/3 left-1/3" style={{ transform: `translate(${scrollY * 0.1}px, ${scrollY * -0.1}px)` }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles size={12} className="animate-pulse" />
              AI-Powered Property Intelligence
              <Sparkles size={12} className="animate-pulse" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tighter">
              <span className="block">Your family&apos;s</span>
              <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-shimmer">
                property empire
              </span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-slate-400 mt-8 max-w-2xl mx-auto leading-relaxed">
              Stop juggling Excel sheets. Track <span className="text-white font-semibold">30+ properties</span> across Ahmedabad — bills, rental income, documents, and ROI. <span className="text-blue-400 font-semibold">AI scans your bills automatically.</span>
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link href="/auth/sign-up" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 hover:from-blue-400 hover:via-indigo-400 hover:to-violet-500 px-8 py-4 rounded-full text-base font-bold transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 animate-gradient">
                Start Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 px-8 py-4 rounded-full text-base font-semibold transition-all backdrop-blur-sm">
                See Features
              </a>
            </div>
          </Reveal>

          {/* Animated skyline */}
          <Reveal delay={400}>
            <div className="relative h-[320px] mt-16">
              <AnimatedSkyline />
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-slate-500">Scroll</span>
          <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-slate-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══ Stats ═══ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 500, suffix: "+", label: "Properties Managed", icon: Building2 },
              { value: 50, suffix: " Cr+", prefix: "₹", label: "Portfolio Tracked", icon: IndianRupee },
              { value: 98, suffix: "%", label: "Uptime", icon: Shield },
              { value: 15, suffix: " Min", label: "Setup Time", icon: Zap },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 100}>
                <div className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <s.icon size={22} className="text-blue-400" />
                  </div>
                  <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    <Counter end={s.value} suffix={s.suffix} prefix={s.prefix} />
                  </p>
                  <p className="text-slate-500 text-sm mt-2">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="py-24 px-6 relative">
        <Particles />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Features</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">
                Everything your
                <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  portfolio needs
                </span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Building2, title: "Property Registry", desc: "Catalog all properties with value, type, area, ownership splits, and registration details.", gradient: "from-blue-500 to-cyan-500" },
              { icon: IndianRupee, title: "Rental Income", desc: "Track rent by property and month. Auto-fill amounts. See who paid and who hasn't.", gradient: "from-emerald-500 to-green-500" },
              { icon: FileText, title: "AI Bill Scanner", desc: "Snap a photo of any Indian utility bill. AI reads UGVCL, AMC, Torrent Power formats.", gradient: "from-violet-500 to-purple-500" },
              { icon: BarChart3, title: "Analytics", desc: "Portfolio value, rental yields, income vs expenses charts, per-property ROI.", gradient: "from-amber-500 to-orange-500" },
              { icon: PieChart, title: "Expense Breakdown", desc: "See where money goes — electricity, water, municipal tax, maintenance by category.", gradient: "from-rose-500 to-pink-500" },
              { icon: TrendingUp, title: "Sale Tracking", desc: "Mark sold, see profit/loss including stamp duty and registration charges.", gradient: "from-cyan-500 to-blue-500" },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <GlowCard {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Dashboard preview ═══ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950" />
        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                See everything at a <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">glance</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <TiltCard>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl shadow-blue-500/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Portfolio", value: "₹12.5 Cr", change: "+18%", color: "from-blue-500 to-indigo-500" },
                    { label: "Monthly Rent", value: "₹4.2L", change: "+12%", color: "from-emerald-500 to-green-500" },
                    { label: "Properties", value: "32", change: "28 occupied", color: "from-violet-500 to-purple-500" },
                    { label: "Yield", value: "5.8%", change: "Above avg", color: "from-amber-500 to-orange-500" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/15 transition-colors">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{s.label}</p>
                      <p className="text-2xl font-bold mt-1">{s.value}</p>
                      <p className={`text-xs mt-1 bg-gradient-to-r ${s.color} bg-clip-text text-transparent font-semibold`}>{s.change}</p>
                    </div>
                  ))}
                </div>
                {/* Fake chart bars */}
                <div className="flex items-end gap-2 h-32">
                  {[35, 50, 40, 65, 55, 80, 70, 90, 75, 85, 65, 95].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500/60 to-violet-500/60 hover:from-blue-400 hover:to-violet-400 transition-colors cursor-pointer" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => <span key={m}>{m}</span>)}
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.2),transparent_50%)]" />
        <Particles />

        <Reveal>
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95]">
              Your properties
              <br />
              <span className="text-blue-200">deserve better.</span>
            </h2>
            <p className="text-blue-100/70 text-lg mt-6 max-w-xl mx-auto">
              Join families across Ahmedabad who replaced their Excel sheets. Free to start, takes 15 minutes.
            </p>
            <Link href="/auth/sign-up" className="group inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-full text-lg font-bold transition-all hover:shadow-2xl hover:shadow-white/20 hover:scale-105 mt-10">
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-slate-950 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-bold">BhoomiQ</span>
          </div>
          <p className="text-slate-600 text-sm">Built for Indian families managing property portfolios.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/auth/sign-in" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
