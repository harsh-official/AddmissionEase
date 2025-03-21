import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function SubscriptionPlans() {
  return (
    <section id="plans" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Subscription Plans
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Choose the Right Plan for You</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We offer flexible plans tailored to your specific needs for JEE and NEET counseling.
            </p>
          </div>
        </div>
        <div className="grid gap-6 pt-12 lg:grid-cols-3 lg:gap-8">
          {/* Basic Plan */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-col space-y-1.5 pb-8">
              <CardTitle className="text-2xl font-bold">Basic Plan</CardTitle>
              <CardDescription>For students needing essential counseling</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                ₹6,990
                <span className="ml-1 text-xl font-normal text-muted-foreground">/one-time</span>
              </div>
            </CardHeader>
            <CardContent className="grid flex-1 gap-4">
              <ul className="grid gap-2.5">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Personalized mentoring for choice filling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>JoSAA or AIQ counseling (for JEE/NEET)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>OR State Govt. counseling only</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Basic rank and college prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register?plan=basic">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Standard Plan */}
          <Card className="flex flex-col border-primary">
            <CardHeader className="flex flex-col space-y-1.5 pb-8">
              <div className="inline-flex items-center rounded-full border border-primary px-2.5 py-0.5 text-xs font-semibold text-primary mb-2">
                Most Popular
              </div>
              <CardTitle className="text-2xl font-bold">Standard Plan</CardTitle>
              <CardDescription>For students needing comprehensive counseling</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                ₹9,490
                <span className="ml-1 text-xl font-normal text-muted-foreground">/one-time</span>
              </div>
            </CardHeader>
            <CardContent className="grid flex-1 gap-4">
              <ul className="grid gap-2.5">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>All Basic Plan features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>JoSAA/AIQ + State Govt. counseling</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Advanced rank and college prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Priority email support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>One video consultation session</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register?plan=standard">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-col space-y-1.5 pb-8">
              <CardTitle className="text-2xl font-bold">Premium Plan</CardTitle>
              <CardDescription>For students needing complete admission support</CardDescription>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                ₹14,990
                <span className="ml-1 text-xl font-normal text-muted-foreground">/one-time</span>
              </div>
            </CardHeader>
            <CardContent className="grid flex-1 gap-4">
              <ul className="grid gap-2.5">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>All Standard Plan features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>JoSAA/AIQ + State + Private colleges</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Dedicated mentor support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Unlimited video consultations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>Document verification assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>24/7 priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register?plan=premium">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

