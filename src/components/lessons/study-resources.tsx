import { ExternalLink, FolderOpen } from "lucide-react";

import { InteractiveCard } from "@/components/ui/card";
import { EXTERNAL_STUDY_RESOURCES } from "@/lib/constants/app";

/**
 * Links to outside study material (shared Drive folders, etc.). These aren't
 * hosted by OnTalk — each opens in a new tab.
 */
export function StudyResources() {
  return (
    <section aria-label="Study resources">
      <p className="mb-2 text-xs font-semibold tracking-wide text-faint-foreground uppercase">
        Study resources
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {EXTERNAL_STUDY_RESOURCES.map((resource) => (
          <li key={resource.href}>
            <InteractiveCard>
              <a
                href={resource.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-start gap-3 rounded-card p-4"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary-subtle text-primary"
                  aria-hidden
                >
                  <FolderOpen className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    {resource.title}
                    <ExternalLink className="size-3.5 shrink-0 text-faint-foreground" aria-hidden />
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
              </a>
            </InteractiveCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
