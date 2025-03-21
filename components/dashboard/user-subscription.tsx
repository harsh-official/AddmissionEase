import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function UserSubscription() {
  // This would typically come from your backend
  const subscription = {
    plan: "Standard",
    status: "active",
    startDate: "2023-10-15",
    features: [
      "JoSAA/AIQ + State Govt. counseling",
      "Advanced rank and college prediction",
      "Priority email support",
      "One video consultation session",
    ],
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </div>
          <Badge variant="outline" className="ml-auto">
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <div className="mb-4 grid grid-cols-[1fr_auto] items-start">
            <div className="grid gap-1">
              <h3 className="font-semibold">{subscription.plan} Plan</h3>
              <p className="text-sm text-muted-foreground">
                Started on {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/subscription">Manage</Link>
              </Button>
            </div>
          </div>
          <ul className="grid gap-2 text-sm">
            {subscription.features.map((feature, index) => (
              <li key={index} className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/subscription/upgrade">Upgrade Plan</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

