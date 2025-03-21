const AWS = require("aws-sdk")
const lexruntime = new AWS.LexRuntime()

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "POST /chatbot/message":
        return await processMessage(requestBody)
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

// Process a message from the chatbot
const processMessage = async (data) => {
  const { message, userId, sessionId } = data

  try {
    // Validate required fields
    if (!message || !userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Message and userId are required" }),
      }
    }

    // Generate a session ID if not provided
    const botSessionId = sessionId || `${userId}-${Date.now()}`

    // Call Amazon Lex
    const params = {
      botName: "JeeNeetPlatformBot",
      botAlias: "PROD",
      userId,
      sessionAttributes: {},
      inputText: message,
    }

    const lexResponse = await lexruntime.postText(params).promise()

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: lexResponse.message,
        sessionId: botSessionId,
        dialogState: lexResponse.dialogState,
        intentName: lexResponse.intentName,
        slots: lexResponse.slots,
      }),
    }
  } catch (error) {
    console.error("Error processing message:", error)

    // If Lex is not available, provide a fallback response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message:
          "I'm sorry, I'm having trouble understanding your request right now. Please try again later or contact our support team for assistance.",
        sessionId: `${userId}-${Date.now()}`,
        dialogState: "Failed",
      }),
    }
  }
}

