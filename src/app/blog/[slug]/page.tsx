import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts, getBlogPost, getAllBlogSlugs } from "@/lib/blog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} — BhoomiQ Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://prop-management-one.vercel.app/blog/${post.slug}`,
      siteName: "BhoomiQ",
      type: "article",
      publishedTime: post.date,
      authors: ["BhoomiQ Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function renderContent(content: string) {
  const paragraphs = content.split("\n\n");
  return paragraphs.map((paragraph, i) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return null;

    // H2 heading
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="text-2xl font-bold text-slate-900 mt-10 mb-4"
        >
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    // H3 heading
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="text-xl font-bold text-slate-900 mt-8 mb-3"
        >
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    // Process inline bold markers
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <p key={i} className="text-slate-600 leading-relaxed mb-4">
        {rendered}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "BhoomiQ Team",
    },
    publisher: {
      "@type": "Organization",
      name: "BhoomiQ",
      url: "https://prop-management-one.vercel.app",
    },
    description: post.excerpt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://prop-management-one.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 hidden sm:block"
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

      {/* Article */}
      <article className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to blog
          </Link>

          {/* Header */}
          <header className="mb-10">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.readTime}
              </span>
              <span className="text-slate-300">|</span>
              <span>By BhoomiQ Team</span>
            </div>
          </header>

          {/* Content */}
          <div className="border-t border-slate-100 pt-8">
            {renderContent(post.content)}
          </div>
        </div>
      </article>

      {/* CTA Banner */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Try BhoomiQ Free
              </h2>
              <p className="text-blue-100/80 mt-3 max-w-lg mx-auto">
                Track properties, rental income, utility bills, and ROI — all
                in one dashboard. Built for Indian property families.
              </p>
              <Link
                href="/auth/sign-up"
                className="group inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-7 py-3.5 rounded-xl text-sm font-bold transition-all hover:shadow-2xl hover:scale-[1.02] mt-6"
              >
                Get Started Free{" "}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 px-6">
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
