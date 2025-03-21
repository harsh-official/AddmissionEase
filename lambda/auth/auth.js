const AWS = require("aws-sdk")
const cognito = new AWS.CognitoIdentityServiceProvider()
const dynamoDB = new AWS.DynamoDB.DocumentClient()

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID
const USERS_TABLE = process.env.USERS_TABLE

// Helper function to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Helper function to generate a unique referral code
const generateReferralCode = (name) => {
  const namePrefix = name.substring(0, 3).toUpperCase()
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${namePrefix}${randomString}`
}

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "POST /auth/register":
        return await register(requestBody)
      case "POST /auth/login":
        return await login(requestBody)
      case "POST /auth/confirm-signup":
        return await confirmSignUp(requestBody)
      case "POST /auth/forgot-password":
        return await forgotPassword(requestBody)
      case "POST /auth/confirm-forgot-password":
        return await confirmForgotPassword(requestBody)
      case "GET /auth/user":
        return await getUser(event.headers.Authorization)
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

// Register a new user
const register = async (data) => {
  const { name, email, phone, password, examType, plan, referralCode } = data

  try {
    // Generate a unique referral code for the user
    const userReferralCode = generateReferralCode(name)

    // Create the user in Cognito
    const cognitoParams = {
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: password,
      UserAttributes: [
        { Name: "name", Value: name },
        { Name: "email", Value: email },
        { Name: "phone_number", Value: phone },
        { Name: "custom:examType", Value: examType || "" },
        { Name: "custom:subscriptionPlan", Value: plan || "basic" },
        { Name: "custom:referralCode", Value: userReferralCode },
      ],
    }

    await cognito.adminCreateUser(cognitoParams).promise()

    // Set the user's permanent password
    await cognito
      .adminSetUserPassword({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: password,
        Permanent: true,
      })
      .promise()

    // Create the user in DynamoDB
    const userId = generateId()
    const userParams = {
      TableName: USERS_TABLE,
      Item: {
        userId,
        email,
        name,
        phone,
        examType: examType || "",
        subscriptionPlan: plan || "basic",
        referralCode: userReferralCode,
        referredBy: referralCode || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    await dynamoDB.put(userParams).promise()

    // If a referral code was provided, process the referral
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
        const referrer = referrerResult.Items[0]

        // Create a record in the referrals table (this will be handled by the referral function)
        // For now, we'll just update the user's record with the referrer's ID
        const updateParams = {
          TableName: USERS_TABLE,
          Key: { userId },
          UpdateExpression: "set referredBy = :referredBy",
          ExpressionAttributeValues: {
            ":referredBy": referrer.userId,
          },
        }

        await dynamoDB.update(updateParams).promise()
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "User registered successfully",
        userId,
        referralCode: userReferralCode,
      }),
    }
  } catch (error) {
    console.error("Error registering user:", error)
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error registering user", error: error.message }),
    }
  }
}

// Login a user
const login = async (data) => {
  const { email, password } = data

  try {
    const params = {
      AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
      ClientId: USER_POOL_CLIENT_ID,
      UserPoolId: USER_POOL_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }

    const authResult = await cognito.adminInitiateAuth(params).promise()

    // Get the user from DynamoDB
    const userParams = {
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    }

    const userResult = await dynamoDB.scan(userParams).promise()
    const user = userResult.Items[0]

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Login successful",
        tokens: authResult.AuthenticationResult,
        user,
      }),
    }
  } catch (error) {
    console.error("Error logging in:", error)
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Invalid credentials", error: error.message }),
    }
  }
}

// Confirm user signup
const confirmSignUp = async (data) => {
  const { email, confirmationCode } = data

  try {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    }

    await cognito.confirmSignUp(params).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "User confirmed successfully" }),
    }
  } catch (error) {
    console.error("Error confirming user:", error)
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error confirming user", error: error.message }),
    }
  }
}

// Forgot password
const forgotPassword = async (data) => {
  const { email } = data

  try {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
    }

    await cognito.forgotPassword(params).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Password reset code sent" }),
    }
  } catch (error) {
    console.error("Error initiating password reset:", error)
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error initiating password reset", error: error.message }),
    }
  }
}

// Confirm forgot password
const confirmForgotPassword = async (data) => {
  const { email, confirmationCode, newPassword } = data

  try {
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    }

    await cognito.confirmForgotPassword(params).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Password reset successful" }),
    }
  } catch (error) {
    console.error("Error confirming password reset:", error)
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error confirming password reset", error: error.message }),
    }
  }
}

// Get user
const getUser = async (token) => {
  if (!token) {
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "No token provided" }),
    }
  }

  try {
    // Extract the JWT token from the Authorization header
    const jwtToken = token.replace("Bearer ", "")

    // Get the user from Cognito
    const params = {
      AccessToken: jwtToken,
    }

    const cognitoUser = await cognito.getUser(params).promise()

    // Extract the email from the user attributes
    const email = cognitoUser.UserAttributes.find((attr) => attr.Name === "email").Value

    // Get the user from DynamoDB
    const userParams = {
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    }

    const userResult = await dynamoDB.scan(userParams).promise()
    const user = userResult.Items[0]

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ user }),
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Invalid token", error: error.message }),
    }
  }
}

