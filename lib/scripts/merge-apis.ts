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
    }
  };

  for (const service of SERVICES) {
    const { data } = await axios.get(service.url);

    Object.keys(data.paths).forEach(path => {
      const methods = data.paths[path];
      Object.keys(methods).forEach(method => {
        const operation = methods[method];

        if (method.toLowerCase() !== 'get') {
          operation.security = [{ CognitoAuth: [] }];
        } else {
          delete operation.security;
        }

        methods[method]['x-amazon-apigateway-integration'] = {
          type: 'http_proxy',
          httpMethod: 'ANY',
          uri: `http://\${ALB_DNS}:${service.port}${path}`,
          connectionType: 'INTERNET',
          requestParameters: {
            'integration.request.header.x-user-id': 'context.authorizer.claims.sub',
            'integration.request.header.x-user-email': 'context.authorizer.claims.email',
            'integration.request.header.x-user-roles': 'context.authorizer.claims.["cognito:groups"]'
          }
        };
      });
      baseSpec.paths[path] = methods;
    });

    if (data.components?.schemas) {
      Object.assign(baseSpec.components.schemas, data.components.schemas);
    }
  }

  fs.writeFileSync('./combined-spec.json', JSON.stringify(baseSpec, null, 2));
}

mergeSpecs();
