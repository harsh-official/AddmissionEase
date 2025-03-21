"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserReferrals } from "../lib/api"
import { useAuth } from "./AuthContext"

interface Referral {
  referralId: string
  referrerId: string
  refereeId: string
  referrerDiscount: number
  refereeDiscount: number
  status: string
  createdAt: string
}

interface ReferralContextType {
  referrals: Referral[]
  totalReferrals: number
  completedReferrals: number
  totalDiscount: number
  isLoading: boolean
  error: Error | null
  refreshReferrals: () => Promise<void>
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined)

export const ReferralProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [totalReferrals, setTotalReferrals] = useState(0)
  const [completedReferrals, setCompletedReferrals] = useState(0)
  const [totalDiscount, setTotalDiscount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReferrals = async () => {
    if (!isAuthenticated || !user) {
      setReferrals([])
      setTotalReferrals(0)
      setCompletedReferrals(0)
      setTotalDiscount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get the user's ID from Cognito
      const userId = user.getUsername()

      // Get the user's referrals
      const response = await getUserReferrals(userId)

      if (response) {
        setReferrals(response.referrals || [])
        setTotalReferrals(response.totalReferrals || 0)
        setCompletedReferrals(response.completedReferrals || 0)
        setTotalDiscount(response.totalDiscount || 0)
      } else {
        setReferrals([])
        setTotalReferrals(0)
        setCompletedReferrals(0)
        setTotalDiscount(0)
      }
    } catch (err) {
      console.error("Error fetching referrals:", err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [isAuthenticated, user])

  const refreshReferrals = async () => {
    await fetchReferrals()
  }

  const value = {
    referrals,
    totalReferrals,
    completedReferrals,
    totalDiscount,
    isLoading,
    error,
    refreshReferrals,
  }

  return <ReferralContext.Provider value={value}>{children}</ReferralContext.Provider>
}

export const useReferral = () => {
  const context = useContext(ReferralContext)
  if (context === undefined) {
    throw new Error("useReferral must be used within a ReferralProvider")
  }
  return context
}

