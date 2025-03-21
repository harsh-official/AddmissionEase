"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Share2 } from "lucide-react"

export function ReferralProgram() {
  const [referralCode] = useState("USER123XYZ")
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode)
    toast({
      title: "Copied to clipboard!",
      description: "Your referral code has been copied.",
    })
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join AdmissionAssist",
        text: `Use my referral code ${referralCode} to get a 1% discount on AdmissionAssist counseling services!`,
        url: `https://admissionassist.com/register?ref=${referralCode}`,
      })
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Program</CardTitle>
        <CardDescription>Refer friends and earn discounts on your subscription</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="referral-code">Your Referral Code</Label>
          <div className="flex items-center gap-2">
            <Input id="referral-code" value={referralCode} readOnly className="font-medium" />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy referral code</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with friends. You'll get 10% off your plan when they sign up.
          </p>
        </div>

        <div className="grid gap-2">
          <h3 className="font-semibold">Referral Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Successful Referrals</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Total Discount Earned</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={shareReferral}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Referral Code
        </Button>
      </CardFooter>
    </Card>
  )
}

