const AWS = require("aws-sdk")
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const ses = new AWS.SES()

// Environment variables
const STUDENT_DATA_TABLE = process.env.STUDENT_DATA_TABLE

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "POST /student-data":
        return await saveStudentData(requestBody)
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

// Save student data
const saveStudentData = async (data) => {
  const { name, email, phone } = data

  try {
    // Validate required fields
    if (!name || !email || !phone) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Name, email, and phone are required" }),
      }
    }

    // Generate a unique ID
    const studentId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const params = {
      TableName: STUDENT_DATA_TABLE,
      Item: {
        studentId,
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }

    await dynamoDB.put(params).promise()

    // Send a welcome email to the student
    await sendWelcomeEmail(name, email)

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Student data saved successfully",
        studentId,
      }),
    }
  } catch (error) {
    console.error("Error saving student data:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error saving student data", error: error.message }),
    }
  }
}

// Send a welcome email to the student
const sendWelcomeEmail = async (name, email) => {
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <html>
              <body>
                <h1>Welcome to AdmissionAssist!</h1>
                <p>Hello ${name},</p>
                <p>Thank you for your interest in our JEE and NEET counseling services. We're here to help you secure admission in your dream college.</p>
                <p>Our team will get in touch with you soon to discuss how we can assist you in your admission journey.</p>
                <p>In the meantime, feel free to explore our website to learn more about our services.</p>
                <p>Best regards,<br>The AdmissionAssist Team</p>
              </body>
            </html>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `
            Welcome to AdmissionAssist!
            
            Hello ${name},
            
            Thank you for your interest in our JEE and NEET counseling services. We're here to help you secure admission in your dream college.
            
            Our team will get in touch with you soon to discuss how we can assist you in your admission journey.
            
            In the meantime, feel free to explore our website to learn more about our services.
            
            Best regards,
            The AdmissionAssist Team
          `,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Welcome to AdmissionAssist!",
      },
    },
    Source: "notifications@admissionassist.com",
  }

  try {
    await ses.sendEmail(params).promise()
    console.log(`Welcome email sent to ${email}`)
  } catch (error) {
    console.error("Error sending welcome email:", error)
    // Don't throw an error, just log it
  }
}

