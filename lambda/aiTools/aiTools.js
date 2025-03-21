const AWS = require("aws-sdk")
const sagemaker = new AWS.SageMakerRuntime()

// Environment variables
const SAGEMAKER_ENDPOINT = process.env.SAGEMAKER_ENDPOINT

exports.handler = async (event) => {
  try {
    const { httpMethod, path, body } = event
    const route = `${httpMethod} ${path}`

    // Parse the request body if it exists
    const requestBody = body ? JSON.parse(body) : {}

    switch (route) {
      case "POST /ai-tools/rank-predictor":
        return await predictRank(requestBody)
      case "POST /ai-tools/college-predictor":
        return await predictCollege(requestBody)
      case "POST /ai-tools/seat-matrix":
        return await getSeatMatrix(requestBody)
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

// Predict rank based on exam score
const predictRank = async (data) => {
  const { examType, score, category } = data

  try {
    // Validate required fields
    if (!examType || !score || !category) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Exam type, score, and category are required" }),
      }
    }

    // For now, we'll use a simple algorithm to predict rank
    // In a real implementation, this would call a SageMaker endpoint
    let predictedRank

    if (examType === "jee") {
      // JEE rank prediction (simplified)
      const maxScore = 360
      const percentile = (score / maxScore) * 100

      if (category === "general") {
        predictedRank = Math.round(1000000 * (1 - percentile / 100))
      } else {
        // For reserved categories, apply a multiplier
        predictedRank = Math.round(1000000 * (1 - percentile / 100) * 0.7)
      }
    } else if (examType === "neet") {
      // NEET rank prediction (simplified)
      const maxScore = 720
      const percentile = (score / maxScore) * 100

      if (category === "general") {
        predictedRank = Math.round(1500000 * (1 - percentile / 100))
      } else {
        // For reserved categories, apply a multiplier
        predictedRank = Math.round(1500000 * (1 - percentile / 100) * 0.7)
      }
    } else {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: 'Invalid exam type. Supported types are "jee" and "neet"' }),
      }
    }

    // Ensure rank is within reasonable bounds
    predictedRank = Math.max(1, predictedRank)

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        examType,
        score,
        category,
        predictedRank,
        rankRange: {
          min: Math.max(1, Math.round(predictedRank * 0.9)),
          max: Math.round(predictedRank * 1.1),
        },
      }),
    }
  } catch (error) {
    console.error("Error predicting rank:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error predicting rank", error: error.message }),
    }
  }
}

// Predict colleges based on rank
const predictCollege = async (data) => {
  const { examType, rank, category, preferences } = data

  try {
    // Validate required fields
    if (!examType || !rank || !category) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Exam type, rank, and category are required" }),
      }
    }

    // Sample college data (in a real implementation, this would come from a database)
    const colleges = [
      {
        name: "Indian Institute of Technology, Bombay",
        code: "IITB",
        type: "IIT",
        branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
        cutoffs: {
          "Computer Science": { general: 500, sc: 2000, st: 2500, obc: 1000 },
          "Electrical Engineering": { general: 1000, sc: 3000, st: 3500, obc: 2000 },
          "Mechanical Engineering": { general: 1500, sc: 4000, st: 4500, obc: 3000 },
        },
      },
      {
        name: "Indian Institute of Technology, Delhi",
        code: "IITD",
        type: "IIT",
        branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
        cutoffs: {
          "Computer Science": { general: 600, sc: 2200, st: 2700, obc: 1200 },
          "Electrical Engineering": { general: 1100, sc: 3200, st: 3700, obc: 2200 },
          "Mechanical Engineering": { general: 1600, sc: 4200, st: 4700, obc: 3200 },
        },
      },
      {
        name: "Indian Institute of Technology, Madras",
        code: "IITM",
        type: "IIT",
        branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
        cutoffs: {
          "Computer Science": { general: 700, sc: 2400, st: 2900, obc: 1400 },
          "Electrical Engineering": { general: 1200, sc: 3400, st: 3900, obc: 2400 },
          "Mechanical Engineering": { general: 1700, sc: 4400, st: 4900, obc: 3400 },
        },
      },
      {
        name: "National Institute of Technology, Trichy",
        code: "NITT",
        type: "NIT",
        branches: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
        cutoffs: {
          "Computer Science": { general: 2000, sc: 8000, st: 10000, obc: 4000 },
          "Electrical Engineering": { general: 4000, sc: 12000, st: 15000, obc: 8000 },
          "Mechanical Engineering": { general: 6000, sc: 15000, st: 18000, obc: 10000 },
        },
      },
      {
        name: "All India Institute of Medical Sciences, Delhi",
        code: "AIIMS",
        type: "Medical",
        branches: ["MBBS"],
        cutoffs: {
          MBBS: { general: 100, sc: 500, st: 700, obc: 300 },
        },
      },
      {
        name: "Christian Medical College, Vellore",
        code: "CMC",
        type: "Medical",
        branches: ["MBBS"],
        cutoffs: {
          MBBS: { general: 200, sc: 800, st: 1000, obc: 500 },
        },
      },
    ]

    // Filter colleges based on exam type
    let filteredColleges = colleges

    if (examType === "jee") {
      filteredColleges = colleges.filter((college) => college.type !== "Medical")
    } else if (examType === "neet") {
      filteredColleges = colleges.filter((college) => college.type === "Medical")
    }

    // Filter colleges and branches based on rank and category
    const eligibleOptions = []

    filteredColleges.forEach((college) => {
      college.branches.forEach((branch) => {
        const cutoff = college.cutoffs[branch][category.toLowerCase()]

        if (rank <= cutoff) {
          eligibleOptions.push({
            college: college.name,
            collegeCode: college.code,
            branch,
            cutoff,
            chanceOfAdmission: calculateChanceOfAdmission(rank, cutoff),
          })
        }
      })
    })

    // Sort by chance of admission (descending)
    eligibleOptions.sort((a, b) => b.chanceOfAdmission - a.chanceOfAdmission)

    // Apply preferences if provided
    if (preferences) {
      if (preferences.collegeType) {
        eligibleOptions.sort((a, b) => {
          const collegeA = colleges.find((c) => c.code === a.collegeCode)
          const collegeB = colleges.find((c) => c.code === b.collegeCode)

          if (collegeA.type === preferences.collegeType && collegeB.type !== preferences.collegeType) {
            return -1
          } else if (collegeA.type !== preferences.collegeType && collegeB.type === preferences.collegeType) {
            return 1
          } else {
            return 0
          }
        })
      }

      if (preferences.branch) {
        eligibleOptions.sort((a, b) => {
          if (a.branch === preferences.branch && b.branch !== preferences.branch) {
            return -1
          } else if (a.branch !== preferences.branch && b.branch === preferences.branch) {
            return 1
          } else {
            return 0
          }
        })
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        examType,
        rank,
        category,
        eligibleOptions,
        totalOptions: eligibleOptions.length,
      }),
    }
  } catch (error) {
    console.error("Error predicting colleges:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error predicting colleges", error: error.message }),
    }
  }
}

// Calculate chance of admission based on rank and cutoff
const calculateChanceOfAdmission = (rank, cutoff) => {
  if (rank <= cutoff * 0.8) {
    return "High"
  } else if (rank <= cutoff * 0.9) {
    return "Medium"
  } else {
    return "Low"
  }
}

// Get seat matrix
const getSeatMatrix = async (data) => {
  const { examType, collegeCode, branch } = data

  try {
    // Sample seat matrix data (in a real implementation, this would come from a database)
    const seatMatrix = {
      IITB: {
        "Computer Science": {
          total: 120,
          general: 60,
          sc: 18,
          st: 9,
          obc: 33,
        },
        "Electrical Engineering": {
          total: 100,
          general: 50,
          sc: 15,
          st: 7,
          obc: 28,
        },
        "Mechanical Engineering": {
          total: 80,
          general: 40,
          sc: 12,
          st: 6,
          obc: 22,
        },
      },
      IITD: {
        "Computer Science": {
          total: 110,
          general: 55,
          sc: 16,
          st: 8,
          obc: 31,
        },
        "Electrical Engineering": {
          total: 90,
          general: 45,
          sc: 13,
          st: 7,
          obc: 25,
        },
        "Mechanical Engineering": {
          total: 70,
          general: 35,
          sc: 10,
          st: 5,
          obc: 20,
        },
      },
      AIIMS: {
        MBBS: {
          total: 100,
          general: 50,
          sc: 15,
          st: 7,
          obc: 28,
        },
      },
    }

    // Filter seat matrix based on college code and branch
    let result

    if (collegeCode && branch) {
      if (!seatMatrix[collegeCode] || !seatMatrix[collegeCode][branch]) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ message: "Seat matrix not found for the specified college and branch" }),
        }
      }

      result = {
        collegeCode,
        branch,
        seats: seatMatrix[collegeCode][branch],
      }
    } else if (collegeCode) {
      if (!seatMatrix[collegeCode]) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ message: "Seat matrix not found for the specified college" }),
        }
      }

      result = {
        collegeCode,
        branches: Object.keys(seatMatrix[collegeCode]).map((branch) => ({
          branch,
          seats: seatMatrix[collegeCode][branch],
        })),
      }
    } else {
      // Return all seat matrix data
      result = Object.keys(seatMatrix).map((collegeCode) => ({
        collegeCode,
        branches: Object.keys(seatMatrix[collegeCode]).map((branch) => ({
          branch,
          seats: seatMatrix[collegeCode][branch],
        })),
      }))
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result),
    }
  } catch (error) {
    console.error("Error getting seat matrix:", error)
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Error getting seat matrix", error: error.message }),
    }
  }
}

