import axios from 'axios';
import fs from 'fs';

interface Service {
  name: string;
  port: number;
  url: string;
  path: string;
}

const SERVICES: Service[] = [
  { name: 'crud', port: 8080, url: 'https://raw.githubusercontent.com/omnsight/omni-osint-crud/main/doc/openapi.json', path: '/osint' },
  { name: 'query', port: 8081, url: 'https://raw.githubusercontent.com/omnsight/omni-osint-query/main/doc/openapi.json', path: '/query' },
  { name: 'monitor', port: 8082, url: 'https://raw.githubusercontent.com/omnsight/omni-monitoring/main/doc/openapi.json', path: '/monitoring' }
];

async function mergeSpecs() {
  const baseSpec: any = {
    openapi: '3.0.1',
    info: { title: 'Nexus Intelligence Platform Unified API', version: '1.0.0' },
    'x-amazon-apigateway-cors': {
      allowOrigins: ['https://api.nexusintelligences.com', 'https://nexusintelligences.com'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      maxAge: 600
    },
    paths: {},
    components: { securitySchemes: {}, schemas: {} }
  };

  for (const service of SERVICES) {
    const { data } = await axios.get(service.url);
    
    // Merge Paths with a prefix to avoid collisions
    Object.keys(data.paths).forEach(path => {
      baseSpec.paths[`${service.path}${path}`] = data.paths[path];
    });

    // Merge Schemas
    if (data.components?.schemas) {
      Object.assign(baseSpec.components.schemas, data.components.schemas);
    }
  }

  // Inject Cognito Security Scheme (The "Integration" part)
  baseSpec.components.securitySchemes = {
    CognitoAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      'x-amazon-apigateway-authtype': 'cognito_user_pools',
      'x-amazon-apigateway-authorizer': {
        type: 'cognito_user_pools',
        providerARNs: ['${COGNITO_USER_POOL_ARN}']
      }
    },
  };

  // Apply security and Proxy integration to all paths
  Object.keys(baseSpec.paths).forEach(path => {
    const service = SERVICES.find(s => path.startsWith(s.path));
    if (!service) {
        console.warn(`No service found for path ${path}`);
        return;
    }
    const methods = baseSpec.paths[path];
    const originalPath = path.substring(service.path.length);
    Object.keys(methods).forEach(method => {
      methods[method].security = [{ CognitoAuth: [] }];
      methods[method]['x-amazon-apigateway-integration'] = {
        type: 'http_proxy',
        httpMethod: 'ANY',
        uri: `http://\${ALB_DNS}:${service.port}${originalPath}`,
        connectionType: 'INTERNET',
        requestParameters: {
          'integration.request.header.x-user-id': 'context.authorizer.claims.sub',
          'integration.request.header.x-user-email': 'context.authorizer.claims.email'
        }
      };
    });
  });

  fs.writeFileSync('./combined-spec.json', JSON.stringify(baseSpec, null, 2));
}

mergeSpecs();
