import { Api as AuthApi } from '@omnsight/clients/src/omniauth/omniauth.js';
import { KeyCloakClientHelper } from './localtest.js';

// --- CONFIGURATION ---
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const REALM = 'omni';
const CLIENT_ID = 'omniauth';
const CLIENT_SECRET = `${CLIENT_ID}-secret`;

if (!KEYCLOAK_URL || !AUTH_SERVICE_URL) {
  throw new Error('Missing required environment variables');
}

describe('OmniAuth Service Tests', () => {
  let authClient: AuthApi<any>;
  let testUserId: string;

  const testUser = {
    username: 'auth',
    firstName: 'Auth',
    lastName: 'Omni',
    email: 'auth@omni.com',
    enabled: true,
    emailVerified: true,
    credentials: [{
      type: 'password',
      value: 'password123',
      temporary: false,
    }],
    requiredActions: [],
  };

  // ----------------------------------------------------------------
  // SETUP
  // ----------------------------------------------------------------
  beforeAll(async () => {
    const kchelper = new KeyCloakClientHelper();

    await kchelper.auth_admin();
    testUserId = await kchelper.createUser(REALM, testUser);
    const testRole = await kchelper.addRoleToUser(REALM, 'omnibasement', 'user', testUserId);
    console.log(`✅ Created user: ${testUser.username}`);
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Attached role: ${testRole.name}(${testRole.id})`);
    const testUserLoginClient = new KeyCloakClientHelper(REALM);
    const userAuthToken = await testUserLoginClient.auth(CLIENT_ID, CLIENT_SECRET, testUser.username, 'password123');
    console.log(`   Retrieved JWT auth token: ${userAuthToken}`);
    authClient = new AuthApi({
      baseURL: AUTH_SERVICE_URL,
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
        'Content-Type': 'application/json',
      },
    });
  });

  // ----------------------------------------------------------------
  // TESTS
  // ----------------------------------------------------------------
  test('should fetch user public data by ID', async () => {
    const response = await authClient.users.getUserById(testUserId);

    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(testUserId);
    expect(response.data.username).toBe(testUser.username);
  });

  test('should handle invalid user ID gracefully (404)', async () => {
    expect.assertions(1);
    try {
      await authClient.users.getUserById('invalid-id');
    } catch (error: any) {
      expect(error.response?.status).toBe(404);
    }
  });

  test('should handle unauthorized access (401)', async () => {
    expect.assertions(1);
    const unauthorizedClient = new AuthApi({ baseURL: AUTH_SERVICE_URL }); // No headers

    try {
      await unauthorizedClient.users.getUserById(testUserId);
    } catch (error: any) {
      expect(error.response?.status).toBe(401);
    }
  });
});
