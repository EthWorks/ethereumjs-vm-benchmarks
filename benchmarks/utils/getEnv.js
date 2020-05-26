exports.getEnv = function(key, fallback) {
  const value = process.env[key];
  if (value !== undefined) {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Environment variable ${key} not found!`);
}
