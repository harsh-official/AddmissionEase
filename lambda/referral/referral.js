const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB.DocumentClient()

// Environment variables
const REFERRALS_TABLE = process.env.REFERRALS_TABLE
const USERS_TABLE = process.env.USERS_TABLE
const SUBSCRIPTIONS_TABLE = process.env.SUBSCRIPTIONS_TABLE

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body, pathParameters } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "GET /referral":
        return await getReferrals()
      case "GET /referral/{referralId}":
        return await getReferralById(pathParameters.referralId)
      case "GET /referral/user/{userId}":
        return await getReferralsByUserId(pathParameters.userId)
      case "POST /referral":
        return await createReferral(requestBody)
      case "POST /referral/validate":
        return await validateReferralCode(requestBody)
      default:
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ message: "Route not found" }),
        }
    }
  } catch (error) {
    console.error("Error:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    }
  }
}

// Get all referrals
const getReferrals = async () => {
  try {
    const params = {
      TableName: REFERRALS_TABLE,
    }

    const result = await dynamoDB.scan(params).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.Items),
    }
  } catch (error) {
    console.error("Error getting referrals:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting referrals", error: error.message }),
    }
  }
}

// Get referral by ID
const getReferralById = async (referralId) => {
  try {
    const params = {
      TableName: REFERRALS_TABLE,
      Key: { referralId },
    }

    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Referral not found" }),
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.Item),
    }
  } catch (error) {
    console.error("Error getting referral:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting referral", error: error.message }),
    }
  }
}

// Get referrals by user ID (as referrer)
const getReferralsByUserId = async (userId) => {
  try {
    const params = {
      TableName: REFERRALS_TABLE,
      IndexName: "referrerIdIndex",
      KeyConditionExpression: "referrerId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    }

    const result = await dynamoDB.query(params).promise()

    // Get the total discount earned
    let totalDiscount = 0

    for (const referral of result.Items) {
      if (referral.status === "completed") {
        totalDiscount += referral.referrerDiscount || 0
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        referrals: result.Items,
        totalReferrals: result.Items.length,
        completedReferrals: result.Items.filter((r) => r.status === "completed").length,
        totalDiscount,
      }),
    }
  } catch (error) {
    console.error("Error getting referrals by user ID:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting referrals by user ID", error: error.message }),
    }
  }
}

// Create a new referral
const createReferral = async (data) => {
  const { referrerCode, refereeId, subscriptionId } = data

  try {
    // Check if the referee exists
    const refereeParams = {
      TableName: USERS_TABLE,
      Key: { userId: refereeId },
    }

    const refereeResult = await dynamoDB.get(refereeParams).promise()

    if (!refereeResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Referee not found" }),
      }
    }

    // Check if the subscription exists
    const subscriptionParams = {
      TableName: SUBSCRIPTIONS_TABLE,
      Key: { subscriptionId },
    }

    const subscriptionResult = await dynamoDB.get(subscriptionParams).promise()

    if (!subscriptionResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Subscription not found" }),
      }
    }

    // Find the referrer by referral code
    const referrerParams = {
      TableName: USERS_TABLE,
      FilterExpression: "referralCode = :referralCode",
      ExpressionAttributeValues: {
        ":referralCode": referrerCode,
      },
    }

    const referrerResult = await dynamoDB.scan(referrerParams).promise()

    if (referrerResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Referrer not found with the provided referral code" }),
      }
    }

    const referrer = referrerResult.Items[0]

    // Check if the referrer and referee are the same person
    if (referrer.userId === refereeId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "You cannot refer yourself" }),
      }
    }

    // Check if this referral already exists
    const existingReferralParams = {
      TableName: REFERRALS_TABLE,
      FilterExpression: "referrerId = :referrerId AND refereeId = :refereeId",
      ExpressionAttributeValues: {
        ":referrerId": referrer.userId,
        ":refereeId": refereeId,
      },
    }

    const existingReferralResult = await dynamoDB.scan(existingReferralParams).promise()

    if (existingReferralResult.Items.length > 0) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "This referral already exists" }),
      }
    }

    // Calculate discounts
    const subscriptionPrice = subscriptionResult.Item.price
    const referrerDiscount = Math.round(subscriptionPrice * 0.1) // 10% discount for referrer
    const refereeDiscount = Math.round(subscriptionPrice * 0.01) // 1% discount for referee

    // Generate a unique ID
    const referralId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const params = {
      TableName: REFERRALS_TABLE,
      Item: {
        referralId,
        referrerId: referrer.userId,
        refereeId,
        referrerCode,
        subscriptionId,
        referrerDiscount,
        refereeDiscount,
        status: "completed", // Since the subscription is already created
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    await dynamoDB.put(params).promise()

    // Update the referee's record with the referrer's ID
    const updateRefereeParams = {
      TableName: USERS_TABLE,
      Key: { userId: refereeId },
      UpdateExpression: "set referredBy = :referrerId, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":referrerId": referrer.userId,
        ":updatedAt": new Date().toISOString(),
      },
    }

    await dynamoDB.update(updateRefereeParams).promise()

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Referral created successfully",
        referralId,
        referrerDiscount,
        refereeDiscount,
      }),
    }
  } catch (error) {
    console.error("Error creating referral:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error creating referral", error: error.message }),
    }
  }
}

// Validate a referral code
const validateReferralCode = async (data) => {
  const { referralCode } = data

  try {
    // Find the user with the given referral code
    const params = {
      TableName: USERS_TABLE,
      FilterExpression: "referralCode = :referralCode",
      ExpressionAttributeValues: {
        ":referralCode": referralCode,
      },
    }

    const result = await dynamoDB.scan(params).promise()

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Invalid referral code" }),
      }
    }

    const referrer = result.Items[0]

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Valid referral code",
        referrerName: referrer.name,
        discountPercentage: 1, // 1% discount for the referee
      }),
    }
  } catch (error) {
    console.error("Error validating referral code:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error validating referral code", error: error.message }),
    }
  }
}

