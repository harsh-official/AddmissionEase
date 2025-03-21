import { DataCollectionForm } from "@/components/data-collection-form"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { Features } from "@/components/features"
import { Hero } from "@/components/hero"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <SubscriptionPlans />
      </main>
      <Footer />
      <DataCollectionForm />
    </div>
  )
}

