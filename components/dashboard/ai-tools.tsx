import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, BookOpen, Search } from "lucide-react"
import Link from "next/link"

export function AITools() {
  const tools = [
    {
      title: "Rank Predictor",
      description: "Predict your rank based on your exam score",
      icon: BarChart,
      href: "/dashboard/ai-tools/rank-predictor",
    },
    {
      title: "College Predictor",
      description: "Find colleges based on your rank and preferences",
      icon: Search,
      href: "/dashboard/ai-tools/college-predictor",
    },
    {
      title: "Seat Matrix",
      description: "Explore available seats across colleges",
      icon: BookOpen,
      href: "/dashboard/ai-tools/seat-matrix",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Powered Tools</CardTitle>
        <CardDescription>Use our AI tools to make informed decisions about your admissions</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{tool.title}</CardTitle>
                <tool.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{tool.description}</p>
                <Button variant="link" className="px-0 text-xs" asChild>
                  <Link href={tool.href}>Try Now</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

