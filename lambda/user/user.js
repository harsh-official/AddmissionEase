const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB.DocumentClient()

// Environment variables
const USERS_TABLE = process.env.USERS_TABLE

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body, pathParameters } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "GET /user":
        return await getUsers()
      case "GET /user/{userId}":
        return await getUserById(pathParameters.userId)
      case "POST /user":
        return await createUser(requestBody)
      case "PUT /user/{userId}":
        return await updateUser(pathParameters.userId, requestBody)
      case "DELETE /user/{userId}":
        return await deleteUser(pathParameters.userId)
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

// Get all users
const getUsers = async () => {
  try {
    const params = {
      TableName: USERS_TABLE,
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
    console.error("Error getting users:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting users", error: error.message }),
    }
  }
}

// Get user by ID
const getUserById = async (userId) => {
  try {
    const params = {
      TableName: USERS_TABLE,
      Key: { userId },
    }

    const result = await dynamoDB.get(params).promise()

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "User not found" }),
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
    console.error("Error getting user:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting user", error: error.message }),
    }
  }
}

// Create a new user
const createUser = async (data) => {
  const { name, email, phone, examType, subscriptionPlan, referralCode } = data

  try {
    // Generate a unique ID
    const userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId,
        name,
        email,
        phone,
        examType: examType || "",
        subscriptionPlan: subscriptionPlan || "basic",
        referralCode: referralCode || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    await dynamoDB.put(params).promise()

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "User created successfully",
        userId,
      }),
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error creating user", error: error.message }),
    }
  }
}

// Update a user
const updateUser = async (userId, data) => {
  try {
    // Check if the user exists
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    }

    const getResult = await dynamoDB.get(getParams).promise()

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "User not found" }),
      }
    }

    // Build the update expression and attribute values
    let updateExpression = "set updatedAt = :updatedAt"
    const expressionAttributeValues = {
      ":updatedAt": new Date().toISOString(),
    }

    // Add the fields to update
    Object.keys(data).forEach((key) => {
      if (key !== "userId") {
        updateExpression += `, ${key} = :${key}`
        expressionAttributeValues[`:${key}`] = data[key]
      }
    })

    const updateParams = {
      TableName: USERS_TABLE,
      Key: { userId },
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
        message: "User updated successfully",
        user: updateResult.Attributes,
      }),
    }
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error updating user", error: error.message }),
    }
  }
}

// Delete a user
const deleteUser = async (userId) => {
  try {
    // Check if the user exists
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    }

    const getResult = await dynamoDB.get(getParams).promise()

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "User not found" }),
      }
    }

    const deleteParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    }

    await dynamoDB.delete(deleteParams).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "User deleted successfully" }),
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error deleting user", error: error.message }),
    }
  }
}

