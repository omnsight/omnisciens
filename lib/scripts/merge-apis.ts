import axios from 'axios';
import fs from 'fs';
import { SERVICES } from '../config';

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
      const operation = methods[method];

      // 1. Enforce Cognito only for non-GET endpoints
      if (method.toLowerCase() !== 'get') {
        operation.security = [{ CognitoAuth: [] }];
      } else {
        delete operation.security;
      }

      methods[method]['x-amazon-apigateway-integration'] = {
        type: 'http_proxy',
        httpMethod: 'ANY',
        uri: `http://\${ALB_DNS}:${service.port}${originalPath}`,
        connectionType: 'INTERNET',
        requestParameters: {
          'integration.request.header.x-user-id': 'context.authorizer.claims.sub',
          'integration.request.header.x-user-email': 'context.authorizer.claims.email',
          'integration.request.header.x-user-roles': 'context.authorizer.claims.["cognito:groups"]'
        }
      };
    });
  });

  fs.writeFileSync('./combined-spec.json', JSON.stringify(baseSpec, null, 2));
}

mergeSpecs();
