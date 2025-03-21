"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getUserSubscriptions } from "../lib/api"
import { useAuth } from "./AuthContext"

interface Subscription {
  subscriptionId: string
  plan: string
  price: number
  status: string
  features: string[]
  startDate: string
}

interface SubscriptionContextType {
  subscription: Subscription | null
  isLoading: boolean
  error: Error | null
  refreshSubscription: () => Promise<void>
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSubscription = async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get the user's ID from Cognito
      const userId = user.getUsername()

      // Get the user's subscriptions
      const response = await getUserSubscriptions(userId)

      if (response && response.length > 0) {
        // Get the active subscription
        const activeSubscription = response.find((sub: Subscription) => sub.status === "active")

        if (activeSubscription) {
          setSubscription(activeSubscription)
        } else {
          // If no active subscription, use the most recent one
          const sortedSubscriptions = response.sort(
            (a: Subscription, b: Subscription) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          )

          setSubscription(sortedSubscriptions[0])
        }
      } else {
        setSubscription(null)
      }
    } catch (err) {
      console.error("Error fetching subscription:", err)
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [isAuthenticated, user])

  const refreshSubscription = async () => {
    await fetchSubscription()
  }

  const value = {
    subscription,
    isLoading,
    error,
    refreshSubscription,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}

