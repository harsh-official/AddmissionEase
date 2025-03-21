import { API } from "aws-amplify"
import { awsConfig } from "../aws-config"
import { getCurrentSession } from "./auth"

// Initialize Amplify API
API.configure({
  API: {
    endpoints: [
      {
        name: "JeeNeetPlatformAPI",
        endpoint: awsConfig.api.invokeUrl,
      },
    ],
  },
})

// Helper function to get authorization header
const getAuthHeader = async () => {
  const session = await getCurrentSession()
  return session ? { Authorization: `Bearer ${session.getIdToken().getJwtToken()}` } : {}
}

// User API
export const getUser = async (userId: string) => {
  try {
    const headers = await getAuthHeader()
    return await API.get("JeeNeetPlatformAPI", `/user/${userId}`, { headers })
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export const updateUser = async (userId: string, data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.put("JeeNeetPlatformAPI", `/user/${userId}`, { headers, body: data })
  } catch (error) {
    console.error("Error updating user:", error)
    throw error
  }
}

// Subscription API
export const getSubscription = async (subscriptionId: string) => {
  try {
    const headers = await getAuthHeader()
    return await API.get("JeeNeetPlatformAPI", `/subscription/${subscriptionId}`, { headers })
  } catch (error) {
    console.error("Error getting subscription:", error)
    throw error
  }
}

export const getUserSubscriptions = async (userId: string) => {
  try {
    const headers = await getAuthHeader()
    return await API.get("JeeNeetPlatformAPI", `/subscription/user/${userId}`, { headers })
  } catch (error) {
    console.error("Error getting user subscriptions:", error)
    throw error
  }
}

export const createSubscription = async (data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/subscription", { headers, body: data })
  } catch (error) {
    console.error("Error creating subscription:", error)
    throw error
  }
}

export const upgradeSubscription = async (data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/subscription/upgrade", { headers, body: data })
  } catch (error) {
    console.error("Error upgrading subscription:", error)
    throw error
  }
}

// Referral API
export const getUserReferrals = async (userId: string) => {
  try {
    const headers = await getAuthHeader()
    return await API.get("JeeNeetPlatformAPI", `/referral/user/${userId}`, { headers })
  } catch (error) {
    console.error("Error getting user referrals:", error)
    throw error
  }
}

export const createReferral = async (data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/referral", { headers, body: data })
  } catch (error) {
    console.error("Error creating referral:", error)
    throw error
  }
}

export const validateReferralCode = async (referralCode: string) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/referral/validate", { headers, body: { referralCode } })
  } catch (error) {
    console.error("Error validating referral code:", error)
    throw error
  }
}

// Student Data API
export const saveStudentData = async (data: any) => {
  try {
    return await API.post("JeeNeetPlatformAPI", "/student-data", { body: data })
  } catch (error) {
    console.error("Error saving student data:", error)
    throw error
  }
}

// AI Tools API
export const predictRank = async (data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/ai-tools/rank-predictor", { headers, body: data })
  } catch (error) {
    console.error("Error predicting rank:", error)
    throw error
  }
}

export const predictCollege = async (data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/ai-tools/college-predictor", { headers, body: data })
  } catch (error) {
    console.error("Error predicting college:", error)
    throw error
  }
}

export const getSeatMatrix = async (data: any) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/ai-tools/seat-matrix", { headers, body: data })
  } catch (error) {
    console.error("Error getting seat matrix:", error)
    throw error
  }
}

// Chatbot API
export const sendChatbotMessage = async (message: string, userId: string, sessionId?: string) => {
  try {
    const headers = await getAuthHeader()
    return await API.post("JeeNeetPlatformAPI", "/chatbot/message", {
      headers,
      body: { message, userId, sessionId },
    })
  } catch (error) {
    console.error("Error sending chatbot message:", error)
    throw error
  }
}

