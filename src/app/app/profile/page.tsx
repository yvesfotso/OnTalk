import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProfileForm } from "@/features/profile/profile-form";
import { LEVEL_LABELS } from "@/lib/constants/app";
import { getSessionContext } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
};

export default async function ProfilePage() {
  const session = await getSessionContext();
  if (!session) redirect("/login");

  const { profile, email } = session;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Profile" description="How OnTalk sees you." />

      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <span
            className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
            aria-hidden
          >
            {profile.display_name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-foreground">
              {profile.display_name}
            </p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone="primary">
                {profile.english_level} — {LEVEL_LABELS[profile.english_level]}
              </Badge>
              {profile.interests.slice(0, 3).map((interest) => (
                <Badge key={interest}>{interest}</Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <ProfileForm
            defaultValues={{
              displayName: profile.display_name,
              englishLevel: profile.english_level,
              learningGoal: profile.learning_goal ?? "personal",
              dailyMinutesGoal: profile.daily_minutes_goal,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
