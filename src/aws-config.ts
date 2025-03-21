// AWS Configuration
export const awsConfig = {
  region: "us-east-1", // Replace with your AWS region

  // Cognito
  cognito: {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "",
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || "",
    identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID || "",
  },

  // API Gateway
  api: {
    invokeUrl: process.env.NEXT_PUBLIC_API_ENDPOINT || "",
  },

  // S3
  storage: {
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET || "",
    region: process.env.NEXT_PUBLIC_S3_REGION || "us-east-1",
  },
}

