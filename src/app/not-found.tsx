import { Compass } from "lucide-react";
import type { Metadata } from "next";

import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-subtle px-4 py-10">
      <Logo />
      <div className="w-full max-w-md">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="The page you're looking for doesn't exist or may have moved."
          action={<ButtonLink href="/">Back to home</ButtonLink>}
        />
      </div>
    </div>
  );
}
