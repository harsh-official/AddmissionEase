const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB.DocumentClient()

// Environment variables
const SUBSCRIPTIONS_TABLE = process.env.SUBSCRIPTIONS_TABLE
const USERS_TABLE = process.env.USERS_TABLE

// Subscription plans and their prices
const SUBSCRIPTION_PLANS = {
  basic: {
    price: 6990,
    features: [
      "Personalized mentoring for choice filling",
      "JoSAA or AIQ counseling (for JEE/NEET)",
      "OR State Govt. counseling only",
      "Basic rank and college prediction",
      "Email support",
    ],
  },
  standard: {
    price: 9490,
    features: [
      "All Basic Plan features",
      "JoSAA/AIQ + State Govt. counseling",
      "Advanced rank and college prediction",
      "Priority email support",
      "One video consultation session",
    ],
  },
  premium: {
    price: 14990,
    features: [
      "All Standard Plan features",
      "JoSAA/AIQ + State + Private colleges",
      "Dedicated mentor support",
      "Unlimited video consultations",
      "Document verification assistance",
      "24/7 priority support",
    ],
  },
}

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body, pathParameters } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "GET /subscription":
        return await getSubscriptions()
      case "GET /subscription/{subscriptionId}":
        return await getSubscriptionById(pathParameters.subscriptionId)
      case "GET /subscription/user/{userId}":
        return await getSubscriptionsByUserId(pathParameters.userId)
      case "POST /subscription":
        return await createSubscription(requestBody)
      case "PUT /subscription/{subscriptionId}":
        return await updateSubscription(pathParameters.subscriptionId, requestBody)
      case "POST /subscription/upgrade":
        return await upgradeSubscription(requestBody)
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

// Get all subscriptions
const getSubscriptions = async () => {
  try {
    const params = {
      TableName: SUBSCRIPTIONS_TABLE,
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
    console.error("Error getting subscriptions:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting subscriptions", error: error.message }),
    }
  }
}

// Get subscription by ID
const getSubscriptionById = async (subscriptionId) => {
  try {
    const params = {
      TableName: SUBSCRIPTIONS_TABLE,
      Key: { subscriptionId },
    }

    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Subscription not found" }),
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
    console.error("Error getting subscription:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting subscription", error: error.message }),
    }
  }
}

// Get subscriptions by user ID
const getSubscriptionsByUserId = async (userId) => {
  try {
    const params = {
      TableName: SUBSCRIPTIONS_TABLE,
      IndexName: "userIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    }

    const result = await dynamoDB.query(params).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.Items),
    }
  } catch (error) {
    console.error("Error getting subscriptions by user ID:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting subscriptions by user ID", error: error.message }),
    }
  }
}

// Create a new subscription
const createSubscription = async (data) => {
  const { userId, plan, referralCode } = data

  try {
    // Check if the user exists
    const userParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    }

    const userResult = await dynamoDB.get(userParams).promise()

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "User not found" }),
      }
    }

    // Check if the plan is valid
    if (!SUBSCRIPTION_PLANS[plan]) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Invalid subscription plan" }),
      }
    }

    // Calculate the price with referral discount if applicable
    let price = SUBSCRIPTION_PLANS[plan].price
    let discountApplied = false

    if (referralCode) {
      // Find the referrer
      const referrerParams = {
        TableName: USERS_TABLE,
        FilterExpression: "referralCode = :referralCode",
        ExpressionAttributeValues: {
          ":referralCode": referralCode,
        },
      }

      const referrerResult = await dynamoDB.scan(referrerParams).promise()

      if (referrerResult.Items.length > 0) {
        // Apply 1% discount for the referee
        price = Math.round(price * 0.99)
        discountApplied = true
      }
    }

    // Generate a unique ID
    const subscriptionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const params = {
      TableName: SUBSCRIPTIONS_TABLE,
      Item: {
        subscriptionId,
        userId,
        plan,
        price,
        discountApplied,
        referralCode: referralCode || null,
        status: "active",
        features: SUBSCRIPTION_PLANS[plan].features,
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    await dynamoDB.put(params).promise()

    // Update the user's subscription plan
    const updateUserParams = {
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: "set subscriptionPlan = :plan, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":plan": plan,
        ":updatedAt": new Date().toISOString(),
      },
    }

    await dynamoDB.update(updateUserParams).promise()

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Subscription created successfully",
        subscriptionId,
        plan,
        price,
        discountApplied,
      }),
    }
  } catch (error) {
    console.error("Error creating subscription:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error creating subscription", error: error.message }),
    }
  }
}

// Update a subscription
const updateSubscription = async (subscriptionId, data) => {
  try {
    // Check if the subscription exists
    const getParams = {
      TableName: SUBSCRIPTIONS_TABLE,
      Key: { subscriptionId },
    }

    const getResult = await dynamoDB.get(getParams).promise()

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Subscription not found" }),
      }
    }

    // Build the update expression and attribute values
    let updateExpression = "set updatedAt = :updatedAt"
    const expressionAttributeValues = {
      ":updatedAt": new Date().toISOString(),
    }

    // Add the fields to update
    Object.keys(data).forEach((key) => {
      if (key !== "subscriptionId") {
        updateExpression += `, ${key} = :${key}`
        expressionAttributeValues[`:${key}`] = data[key]
      }
    })

    const updateParams = {
      TableName: SUBSCRIPTIONS_TABLE,
      Key: { subscriptionId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    }

    const updateResult = await dynamoDB.update(updateParams).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Subscription updated successfully",
        subscription: updateResult.Attributes,
      }),
    }
  } catch (error) {
    console.error("Error updating subscription:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error updating subscription", error: error.message }),
    }
  }
}

// Upgrade a subscription
const upgradeSubscription = async (data) => {
  const { userId, newPlan } = data

  try {
    // Check if the user exists
    const userParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    }

    const userResult = await dynamoDB.get(userParams).promise()

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "User not found" }),
      }
    }

    // Check if the new plan is valid
    if (!SUBSCRIPTION_PLANS[newPlan]) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Invalid subscription plan" }),
      }
    }

    // Get the user's current subscription
    const subscriptionParams = {
      TableName: SUBSCRIPTIONS_TABLE,
      IndexName: "userIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    }

    const subscriptionResult = await dynamoDB.query(subscriptionParams).promise()

    if (subscriptionResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "No active subscription found for this user" }),
      }
    }

    // Get the most recent subscription
    const currentSubscription = subscriptionResult.Items.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    )[0]

    // Check if the new plan is an upgrade
    const currentPlanPrice = SUBSCRIPTION_PLANS[currentSubscription.plan].price
    const newPlanPrice = SUBSCRIPTION_PLANS[newPlan].price

    if (newPlanPrice <= currentPlanPrice) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "New plan must be an upgrade from the current plan" }),
      }
    }

    // Calculate the prorated price
    const startDate = new Date(currentSubscription.startDate)
    const now = new Date()
    const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))

    // Assuming a 365-day subscription period
    const remainingDays = 365 - daysPassed
    const remainingValue = (currentPlanPrice / 365) * remainingDays
    const upgradeCost = newPlanPrice - remainingValue

    // Update the current subscription to inactive
    const updateCurrentParams = {
      TableName: SUBSCRIPTIONS_TABLE,
      Key: { subscriptionId: currentSubscription.subscriptionId },
      UpdateExpression: "set status = :status, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":status": "inactive",
        ":updatedAt": now.toISOString(),
      },
    }

    await dynamoDB.update(updateCurrentParams).promise()

    // Create a new subscription
    const subscriptionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const newSubscriptionParams = {
      TableName: SUBSCRIPTIONS_TABLE,
      Item: {
        subscriptionId,
        userId,
        plan: newPlan,
        price: Math.round(upgradeCost),
        status: "active",
        features: SUBSCRIPTION_PLANS[newPlan].features,
        startDate: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        previousSubscriptionId: currentSubscription.subscriptionId,
      },
    }

    await dynamoDB.put(newSubscriptionParams).promise()

    // Update the user's subscription plan
    const updateUserParams = {
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: "set subscriptionPlan = :plan, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":plan": newPlan,
        ":updatedAt": now.toISOString(),
      },
    }

    await dynamoDB.update(updateUserParams).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Subscription upgraded successfully",
        subscriptionId,
        plan: newPlan,
        upgradeCost: Math.round(upgradeCost),
      }),
    }
  } catch (error) {
    console.error("Error upgrading subscription:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error upgrading subscription", error: error.message }),
    }
  }
}

