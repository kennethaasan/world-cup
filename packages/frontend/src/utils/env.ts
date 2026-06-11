export function getEnvVar(key: string): string {
  const envVar = (import.meta.env as Record<string, string | undefined>)[key];

  if (!envVar || typeof envVar !== 'string') {
    throw new Error(`enviroment variable ${key} is required`);
  }

  return envVar;
}
