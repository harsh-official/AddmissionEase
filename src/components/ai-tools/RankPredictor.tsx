"use client"

import type React from "react"
import { useState } from "react"
import { predictRank } from "../../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface RankPrediction {
  examType: string
  score: number
  category: string
  predictedRank: number
  rankRange: {
    min: number
    max: number
  }
}

export function RankPredictor() {
  const [examType, setExamType] = useState<string>("")
  const [score, setScore] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [prediction, setPrediction] = useState<RankPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate inputs
    if (!examType || !score || !category) {
      setError("Please fill in all fields")
      return
    }

    const scoreNum = Number.parseFloat(score)
    if (isNaN(scoreNum)) {
      setError("Score must be a number")
      return
    }

    // Clear previous results
    setPrediction(null)
    setError(null)
    setIsLoading(true)

    try {
      const result = await predictRank({
        examType,
        score: scoreNum,
        category,
      })

      setPrediction(result)
    } catch (err) {
      console.error("Error predicting rank:", err)
      setError("Failed to predict rank. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rank Predictor</CardTitle>
        <CardDescription>Predict your rank based on your exam score</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="examType">Exam Type</Label>
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
            <Label htmlFor="score">Exam Score</Label>
            <Input
              id="score"
              type="number"
              placeholder="Enter your score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max={examType === "jee" ? "360" : "720"}
            />
            {examType && (
              <p className="text-xs text-muted-foreground">Max score: {examType === "jee" ? "360" : "720"}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
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
              "Predict Rank"
            )}
          </Button>
        </form>
      </CardContent>

      {prediction && (
        <CardFooter className="flex flex-col items-start">
          <div className="w-full p-4 bg-muted rounded-md">
            <h3 className="font-semibold text-lg mb-2">Prediction Result</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Exam:</span>
                <span className="font-medium">{prediction.examType === "jee" ? "JEE Main" : "NEET"}</span>
              </div>
              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-medium">{prediction.score}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">{prediction.category.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Predicted Rank:</span>
                <span className="font-bold text-primary">{prediction.predictedRank.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Rank Range:</span>
                <span className="font-medium">
                  {prediction.rankRange.min.toLocaleString()} - {prediction.rankRange.max.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

