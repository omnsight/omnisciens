interface Service {
  name: string;
  port: number;
  url: string;
  path: string;
}

export const SERVICES: Service[] = [
  { name: 'crud', port: 8080, url: 'https://raw.githubusercontent.com/omnsight/omni-osint-crud/main/doc/openapi.json', path: '/osint' },
  { name: 'query', port: 8081, url: 'https://raw.githubusercontent.com/omnsight/omni-osint-query/main/doc/openapi.json', path: '/query' },
  { name: 'monitor', port: 8082, url: 'https://raw.githubusercontent.com/omnsight/omni-monitoring/main/doc/openapi.json', path: '/monitoring' }
];

export const SERVICE_CONFIG = {
  ARANGODB_HOST: "http://arangodb:8529",
  ARANGODB_USERNAME: "root",
  ARANGODB_DB_NAME: "test_osint_db",
  ARANGODB_EMBEDDING_DIMENSION: "2048",
  EMBEDDING_UPDATE_DAYS: "7",
  EMBEDDING_MODEL: "Qwen/Qwen3-Embedding-4B",
  REDIS_HOST: "redis",
  REDIS_PORT: "6379",
};

export function toEnvFormat(config: Record<string, string>): string {
  return Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}
