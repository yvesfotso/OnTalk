import Image from "next/image";

import { cn } from "@/lib/utils/cn";

/**
 * A real photo of someone using the app, dressed with the same backdrop and
 * floating badges as the rest of the marketing page's illustrated language.
 */
export function LearnerPhoto({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-sm", className)} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-[85%] rounded-full bg-primary-subtle" />
      </div>
      <span className="absolute top-4 left-2 size-9 rounded-full bg-success-subtle sm:top-6 sm:left-4" />
      <span className="absolute right-4 bottom-10 size-6 rounded-full bg-accent-subtle sm:right-6" />

      <div className="relative overflow-hidden rounded-[2rem] border-4 border-surface shadow-pop">
        <Image
          src="/images/learner-phone.jpg"
          alt="A learner smiling while reviewing OnTalk on their phone"
          width={640}
          height={800}
          className="aspect-4/5 w-full object-cover"
          priority
        />
      </div>

      <div className="animate-rise absolute top-6 -right-3 max-w-[168px] rounded-2xl border border-border bg-surface px-3.5 py-2.5 shadow-raised sm:-right-6">
        <p className="text-sm font-semibold text-foreground">Hello!</p>
        <p className="text-xs text-muted-foreground">Nice to meet you.</p>
      </div>

      <div className="absolute bottom-16 -left-3 flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 shadow-raised sm:-left-6">
        <span className="text-base leading-none">🔥</span>
        <span className="text-sm font-bold text-foreground">4</span>
      </div>

      <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-dark px-4 py-2 shadow-raised">
        <span className="text-primary">✦</span>
        <span className="text-sm font-bold text-dark-foreground">+20 XP</span>
      </div>
    </div>
  );
}
