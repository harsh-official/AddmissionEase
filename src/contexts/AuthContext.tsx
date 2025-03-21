"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Auth, Hub } from "aws-amplify"
import type { CognitoUser } from "@aws-amplify/auth"

interface AuthContextType {
  user: CognitoUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    examType: string,
    plan: string,
    referralCode?: string,
  ) => Promise<any>
  confirmSignUp: (email: string, code: string) => Promise<any>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<any>
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkUser()

    const listener = Hub.listen("auth", ({ payload: { event, data } }) => {
      switch (event) {
        case "signIn":
          setUser(data)
          break
        case "signOut":
          setUser(null)
          break
      }
    })

    return () => listener()
  }, [])

  const checkUser = async () => {
    try {
      const userData = await Auth.currentAuthenticatedUser()
      setUser(userData)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const user = await Auth.signIn(email, password)
      setUser(user)
      return user
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    }
  }

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    examType: string,
    plan: string,
    referralCode?: string,
  ) => {
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          name,
          email,
          phone_number: phone,
          "custom:examType": examType,
          "custom:subscriptionPlan": plan,
          "custom:referralCode": referralCode || "",
        },
      })

      return result
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    }
  }

  const confirmSignUp = async (email: string, code: string) => {
    try {
      return await Auth.confirmSignUp(email, code)
    } catch (error) {
      console.error("Error confirming sign up:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await Auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      return await Auth.forgotPassword(email)
    } catch (error) {
      console.error("Error initiating forgot password:", error)
      throw error
    }
  }

  const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    try {
      return await Auth.forgotPasswordSubmit(email, code, newPassword)
    } catch (error) {
      console.error("Error confirming forgot password:", error)
      throw error
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    confirmForgotPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

