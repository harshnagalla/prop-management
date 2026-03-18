import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ArrowRight, Clock, Calendar } from "lucide-react";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — BhoomiQ | Property Management Insights for India",
  description:
    "Practical guides on rental yield, stamp duty, utility bill tracking, and property management for Indian families. Expert insights from the BhoomiQ team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — BhoomiQ | Property Management Insights for India",
    description:
      "Practical guides on rental yield, stamp duty, utility bill tracking, and property management for Indian families.",
    url: "https://prop-management-one.vercel.app/blog",
    siteName: "BhoomiQ",
    type: "website",
  },
};

const categoryColors: Record<string, string> = {
  Investment: "bg-emerald-500",
  "Legal & Tax": "bg-violet-500",
  "Property Management": "bg-blue-500",
  "Utility Bills": "bg-amber-500",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              BhoomiQ
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              className="text-sm font-medium text-blue-600 px-4 py-2 hidden sm:block"
            >
              Blog
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 hidden sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-16 pb-10 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
            Blog
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Property Management Insights
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
            Practical guides on rental yield, stamp duty, utility bills, and
            managing your property portfolio in India.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 overflow-hidden"
              >
                {/* Colored header */}
                <div
                  className={`${categoryColors[post.category] || "bg-blue-500"} h-2`}
                />
                <div className="p-6">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {post.category}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readTime}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 mt-4 group-hover:gap-2 transition-all">
                    Read article{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">BhoomiQ</span>
          </div>
          <p className="text-slate-400 text-sm">
            Built for Indian families managing property portfolios.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link
              href="/blog"
              className="hover:text-slate-900 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-900 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/auth/sign-in"
              className="hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
