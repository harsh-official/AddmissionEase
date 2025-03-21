"use client"

import type React from "react"
import { useState } from "react"
import { getSeatMatrix } from "../../lib/api"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SeatDistribution {
  total: number
  general: number
  sc: number
  st: number
  obc: number
}

interface BranchSeats {
  branch: string
  seats: SeatDistribution
}

interface CollegeSeats {
  collegeCode: string
  branches: BranchSeats[]
}

// Add these type guard functions after the interfaces
function isCollegeSeatsArray(data: CollegeSeats | CollegeSeats[] | null): data is CollegeSeats[] {
  return Array.isArray(data);
}

function isSingleCollege(data: CollegeSeats | CollegeSeats[] | null): data is CollegeSeats {
  return data !== null && !Array.isArray(data) && Array.isArray(data.branches);
}

export function SeatMatrix() {
  const [collegeCode, setCollegeCode] = useState<string>("")
  const [branch, setBranch] = useState<string>("")
  const [seatData, setSeatData] = useState<CollegeSeats | null | CollegeSeats[]>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous results
    setSeatData(null)
    setError(null)
    setIsLoading(true)

    try {
      const result = await getSeatMatrix({
        collegeCode: collegeCode || undefined,
        branch: branch || undefined,
      })

      setSeatData(result)
    } catch (err) {
      console.error("Error getting seat matrix:", err)
      setError("Failed to get seat matrix. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Seat Matrix</CardTitle>
        <CardDescription>Explore available seats across colleges</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="collegeCode">College</Label>
            <Select
              value={collegeCode}
              onValueChange={(value) => {
                setCollegeCode(value)
                setBranch("") // Reset branch when college changes
              }}
            >
              <SelectTrigger id="collegeCode">
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Colleges</SelectItem>
                <SelectItem value="IITB">IIT Bombay</SelectItem>
                <SelectItem value="IITD">IIT Delhi</SelectItem>
                <SelectItem value="AIIMS">AIIMS Delhi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {collegeCode && (
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Branches</SelectItem>
                  {collegeCode === "AIIMS" ? (
                    <SelectItem value="MBBS">MBBS</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

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
                Loading...
              </>
            ) : (
              "View Seat Matrix"
            )}
          </Button>
        </form>
      </CardContent>

      {seatData && (
        <CardFooter className="flex flex-col items-start">
          <div className="w-full">
            <h3 className="font-semibold text-lg mb-2">
              {collegeCode ? `Seat Matrix for ${collegeCode}` : "Seat Matrix for All Colleges"}
            </h3>

            <div className="overflow-x-auto w-full">
              {isCollegeSeatsArray(seatData) ? (
                // Multiple colleges
                <div className="space-y-6">
                  {seatData.map((college, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-md mb-2">{college.collegeCode}</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Branch</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>General</TableHead>
                            <TableHead>SC</TableHead>
                            <TableHead>ST</TableHead>
                            <TableHead>OBC</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {college.branches.map((branchData, branchIndex) => (
                            <TableRow key={branchIndex}>
                              <TableCell className="font-medium">{branchData.branch}</TableCell>
                              <TableCell>{branchData.seats.total}</TableCell>
                              <TableCell>{branchData.seats.general}</TableCell>
                              <TableCell>{branchData.seats.sc}</TableCell>
                              <TableCell>{branchData.seats.st}</TableCell>
                              <TableCell>{branchData.seats.obc}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                </div>
              ) : isSingleCollege(seatData) ? (
                // Single college
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>General</TableHead>
                      <TableHead>SC</TableHead>
                      <TableHead>ST</TableHead>
                      <TableHead>OBC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seatData.branches.map((branchData, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{branchData.branch}</TableCell>
                        <TableCell>{branchData.seats.total}</TableCell>
                        <TableCell>{branchData.seats.general}</TableCell>
                        <TableCell>{branchData.seats.sc}</TableCell>
                        <TableCell>{branchData.seats.st}</TableCell>
                        <TableCell>{branchData.seats.obc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : null}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

