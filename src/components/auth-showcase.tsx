import { Link } from "@tanstack/react-router";

import { BrandMark } from "@/components/brand-mark";
import { Sparkles } from "lucide-react";

export function AuthShowcase() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary to-accent p-10 text-primary-foreground lg:flex">
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-black/20 blur-3xl" />
      <Link to="/" className="relative inline-flex items-center gap-3 self-start">
        <BrandMark size={48} className="rounded-xl bg-white p-1" />
        <span className="text-xl font-semibold tracking-tight">FixMySite AI</span>
      </Link>
      <div className="relative max-w-md space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> AI-powered audits
        </div>
        <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
          Audit your site. Ship the fix. In minutes, not weeks.
        </h1>
        <p className="text-sm leading-relaxed text-primary-foreground/80">
          Scan SEO, performance, accessibility, security, and UX, then see what to fix next.
        </p>
      </div>
      <div className="relative text-xs text-primary-foreground/70">© 2026 FixMySite AI</div>
    </aside>
  );
}
