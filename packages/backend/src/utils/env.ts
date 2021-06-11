import dotenv from 'dotenv';
dotenv.config();

function getOptionalEnviromentVariable(
  enviromentVariable: string
): string | undefined {
  return process.env[enviromentVariable];
}

export function getEnviromentVariable(enviromentVariable: string): string {
  const envVar = getOptionalEnviromentVariable(enviromentVariable);

  if (!envVar || typeof envVar !== 'string') {
    throw new Error(`enviroment variable ${enviromentVariable} is required`);
  }

  return envVar;
}
