"use client"

import type React from "react"
import { useState } from "react"
import { predictCollege } from "../../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CollegeOption {
  college: string
  collegeCode: string
  branch: string
  cutoff: number
  chanceOfAdmission: string
}

interface CollegePrediction {
  examType: string
  rank: number
  category: string
  eligibleOptions: CollegeOption[]
  totalOptions: number
}

export function CollegePredictor() {
  const [examType, setExamType] = useState<string>("")
  const [rank, setRank] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [preferredBranch, setPreferredBranch] = useState<string>("")
  const [preferredCollegeType, setPreferredCollegeType] = useState<string>("")
  const [prediction, setPrediction] = useState<CollegePrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!examType || !rank || !category) {
      setError("Please fill in all required fields")
      return
    }

    const rankNum = Number.parseInt(rank, 10)
    if (isNaN(rankNum) || rankNum <= 0) {
      setError("Rank must be a positive number")
      return
    }

    // Clear previous results
    setPrediction(null)
    setError(null)
    setIsLoading(true)

    try {
      const result = await predictCollege({
        examType,
        rank: rankNum,
        category,
        preferences: {
          branch: preferredBranch || undefined,
          collegeType: preferredCollegeType || undefined,
        },
      })

      setPrediction(result)
    } catch (err) {
      console.error("Error predicting colleges:", err)
      setError("Failed to predict colleges. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const getChanceBadgeColor = (chance: string) => {
    switch (chance) {
      case "High":
        return "bg-green-500"
      case "Medium":
        return "bg-yellow-500"
      case "Low":
        return "bg-red-500"
      default:
        return ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>College Predictor</CardTitle>
        <CardDescription>Find colleges based on your rank and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examType">Exam Type *</Label>
            <Select value={examType} onValueChange={setExamType}>
              <SelectTrigger id="examType">
                <SelectValue placeholder="Select exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jee">JEE Main</SelectItem>
                <SelectItem value="neet">NEET</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rank">Rank *</Label>
            <Input
              id="rank"
              type="number"
              placeholder="Enter your rank"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select your category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="sc">SC</SelectItem>
                <SelectItem value="st">ST</SelectItem>
                <SelectItem value="obc">OBC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredBranch">Preferred Branch (Optional)</Label>
            <Select value={preferredBranch} onValueChange={setPreferredBranch}>
              <SelectTrigger id="preferredBranch">
                <SelectValue placeholder="Select preferred branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                <SelectItem value="MBBS">MBBS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredCollegeType">Preferred College Type (Optional)</Label>
            <Select value={preferredCollegeType} onValueChange={setPreferredCollegeType}>
              <SelectTrigger id="preferredCollegeType">
                <SelectValue placeholder="Select preferred college type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="IIT">IIT</SelectItem>
                <SelectItem value="NIT">NIT</SelectItem>
                <SelectItem value="Medical">Medical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              "Predict Colleges"
            )}
          </Button>
        </form>
      </CardContent>

      {prediction && (
        <CardFooter className="flex flex-col items-start">
          <div className="w-full">
            <h3 className="font-semibold text-lg mb-2">Eligible Colleges ({prediction.totalOptions})</h3>

            {prediction.eligibleOptions.length > 0 ? (
              <div className="overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>College</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Cutoff</TableHead>
                      <TableHead>Chance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prediction.eligibleOptions.map((option, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{option.college}</TableCell>
                        <TableCell>{option.branch}</TableCell>
                        <TableCell>{option.cutoff.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getChanceBadgeColor(option.chanceOfAdmission)}>
                            {option.chanceOfAdmission}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Alert>
                <AlertTitle>No eligible colleges found</AlertTitle>
                <AlertDescription>Try adjusting your rank or category to see more options.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

