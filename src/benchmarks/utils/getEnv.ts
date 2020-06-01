export function getEnv (key: string, fallback: string) {
  const value = process.env[key]
  if (value !== undefined) {
    return value
  }
  if (fallback !== undefined) {
    return fallback
  }
  throw new Error(`Environment variable ${key} not found!`)
}

export function getBooleanEnv (key: string, fallback?: boolean) {
  return getEnv(key, `${fallback}`) === 'true'
}
