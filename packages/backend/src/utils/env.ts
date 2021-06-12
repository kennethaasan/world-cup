import dotenv from 'dotenv';
dotenv.config();

function getOptionalEnvVar(environmentVariable: string): string | undefined {
  return process.env[environmentVariable];
}

export function getEnvVar(environmentVariable: string): string {
  const envVar = getOptionalEnvVar(environmentVariable);

  if (!envVar || typeof envVar !== 'string') {
    throw new Error(`environment variable ${environmentVariable} is required`);
  }

  return envVar;
}
