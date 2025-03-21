import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { UserSubscription } from "@/components/dashboard/user-subscription"
import { ReferralProgram } from "@/components/dashboard/referral-program"
import { AITools } from "@/components/dashboard/ai-tools"

export const metadata: Metadata = {
  title: "Dashboard | AdmissionAssist",
  description: "Manage your subscription and referrals",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <DashboardShell>
            <div className="grid gap-8">
              <UserSubscription />
              <ReferralProgram />
              <AITools />
            </div>
          </DashboardShell>
        </main>
      </div>
    </div>
  )
}

