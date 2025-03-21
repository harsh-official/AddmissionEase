import { Auth } from "aws-amplify"
import { awsConfig } from "../aws-config"

// Initialize Amplify
Auth.configure({
  region: awsConfig.region,
  userPoolId: awsConfig.cognito.userPoolId,
  userPoolWebClientId: awsConfig.cognito.userPoolWebClientId,
  identityPoolId: awsConfig.cognito.identityPoolId,
})

// Sign up
export const signUp = async (
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

// Confirm sign up
export const confirmSignUp = async (email: string, code: string) => {
  try {
    return await Auth.confirmSignUp(email, code)
  } catch (error) {
    console.error("Error confirming sign up:", error)
    throw error
  }
}

// Sign in
export const signIn = async (email: string, password: string) => {
  try {
    const user = await Auth.signIn(email, password)
    return user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

// Sign out
export const signOut = async () => {
  try {
    await Auth.signOut()
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Get current authenticated user
export const getCurrentUser = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Get current session
export const getCurrentSession = async () => {
  try {
    const session = await Auth.currentSession()
    return session
  } catch (error) {
    console.error("Error getting current session:", error)
    return null
  }
}

// Forgot password
export const forgotPassword = async (email: string) => {
  try {
    return await Auth.forgotPassword(email)
  } catch (error) {
    console.error("Error initiating forgot password:", error)
    throw error
  }
}

// Confirm forgot password
export const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
  try {
    return await Auth.forgotPasswordSubmit(email, code, newPassword)
  } catch (error) {
    console.error("Error confirming forgot password:", error)
    throw error
  }
}

// Change password
export const changePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    return await Auth.changePassword(user, oldPassword, newPassword)
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

// Update user attributes
export const updateUserAttributes = async (attributes: Record<string, string>) => {
  try {
    const user = await Auth.currentAuthenticatedUser()
    return await Auth.updateUserAttributes(user, attributes)
  } catch (error) {
    console.error("Error updating user attributes:", error)
    throw error
  }
}

