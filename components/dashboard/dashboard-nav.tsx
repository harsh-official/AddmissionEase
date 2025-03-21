"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, User, CreditCard, Share2, MessageSquare, BarChart, Settings, HelpCircle } from "lucide-react"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Subscription",
    href: "/dashboard/subscription",
    icon: CreditCard,
  },
  {
    title: "Referrals",
    href: "/dashboard/referrals",
    icon: Share2,
  },
  {
    title: "AI Tools",
    href: "/dashboard/ai-tools",
    icon: BarChart,
  },
  {
    title: "Chat Support",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const isActive = pathname === item.href
        return (
          <Link key={index} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn("w-full justify-start", isActive ? "bg-primary text-primary-foreground" : "")}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}

