export const SERVICE_CONFIG = {
  ARANGODB_HOST: "http://arangodb:8529",
  ARANGODB_USERNAME: "root",
  ARANGODB_DB_NAME: "test_osint_db",
  ARANGODB_EMBEDDING_DIMENSION: "1536",
  REDIS_HOST: "redis",
  REDIS_PORT: "6379",
  REDIS_PASSWORD: "",
  EMBEDDING_MODEL: "",
};

export function toEnvFormat(config: Record<string, string>): string {
  return Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}
