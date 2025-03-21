import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Your Path to the Perfect College Admission
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Expert guidance for JEE and NEET aspirants. Personalized counseling to help you secure admission in your
                dream college.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg">
                <Link href="#plans">View Plans</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[300px] w-full md:h-[400px] lg:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-2 text-center">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Trusted by 10,000+ students</div>
                  <h2 className="text-2xl font-bold">JEE & NEET Counseling</h2>
                  <p className="text-muted-foreground">Personalized guidance for your admission journey</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

