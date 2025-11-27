import {
  Api as GeoApi,
} from '@omnsight/clients/src/geovision/geovision.js';
import {
  Api as BasementApi,
} from '@omnsight/clients/src/omnibasement/omnibasement.js';
import { KeyCloakClientHelper } from './localtest.js';

// --- CONFIGURATION ---
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const BASEMENT_API_URL = process.env.BASEMENT_API_URL;
const GEOVISION_API_URL = process.env.GEOVISION_API_URL;
const REALM = 'omni';
const CLIENT_ID = 'geovision';
const CLIENT_SECRET = `${CLIENT_ID}-secret`;

// Fail fast if env is missing
if (!KEYCLOAK_URL || !GEOVISION_API_URL || !BASEMENT_API_URL) {
  throw new Error('Missing required environment variables: KEYCLOAK_URL or GEOVISION_API_URL or BASEMENT_API_URL');
}

describe('Geovision Service Tests', () => {
  let userGeoClient: GeoApi<any>;
  let adminGeoClient: GeoApi<any>;
  let adminBasementClient: BasementApi<any>;

  const testUser = {
    username: 'geouser',
    firstName: 'GeoUser',
    lastName: 'Omni',
    email: 'geouser@omni.com',
    enabled: true,
    emailVerified: true,
    credentials: [{
      type: 'password',
      value: 'password123',
      temporary: false,
    }],
    requiredActions: [],
  };

  const adminUser = {
    username: 'geoadmin',
    firstName: 'GeoAdmin',
    lastName: 'Omni',
    email: 'geoadmin@omni.com',
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
    const testUserID = await kchelper.createUser(REALM, testUser);
    const testRole = await kchelper.addRoleToUser(REALM, 'geovision', 'user', testUserID);
    console.log(`✅ Created user: ${testUser.username}`);
    console.log(`   User ID: ${testUserID}`);
    console.log(`   Attached role: ${testRole.name}(${testRole.id})`);
    const testUserLoginClient = new KeyCloakClientHelper(REALM);
    const userAuthToken = await testUserLoginClient.auth(CLIENT_ID, CLIENT_SECRET, testUser.username, 'password123');
    console.log(`   Retrieved JWT auth token: ${userAuthToken}`);
    userGeoClient = new GeoApi({
      baseURL: GEOVISION_API_URL,
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
        'Content-Type': 'application/json',
      },
    });

    const adminUserID = await kchelper.createUser(REALM, adminUser);
    const adminRole = await kchelper.addRoleToUser(REALM, 'geovision', 'admin', adminUserID);
    const baseAdminRole = await kchelper.addRoleToUser(REALM, 'omnibasement', 'admin', adminUserID);
    console.log(`✅ Created user: ${adminUser.username}`);
    console.log(`   User ID: ${adminUserID}`);
    console.log(`   Attached role: ${adminRole.name}(${adminRole.id}), ${baseAdminRole.name}(${baseAdminRole.id})`);
    const adminUserLoginClient = new KeyCloakClientHelper(REALM);
    const adminAuthToken = await adminUserLoginClient.auth(CLIENT_ID, CLIENT_SECRET, adminUser.username, 'password123');
    console.log(`   Retrieved JWT auth token: ${adminAuthToken}`);
    adminGeoClient = new GeoApi({
      baseURL: GEOVISION_API_URL,
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
    });
    adminBasementClient = new BasementApi({
      baseURL: BASEMENT_API_URL,
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
    });
  });

  // ----------------------------------------------------------------
  // TESTS
  // ----------------------------------------------------------------

  test('should fetch events with default parameters', async () => {
    const startTime = Date.now() - 24 * 60 * 60 * 1000;
    const endTime = Date.now();

    const createEvent1Resp = await adminBasementClient.v1.eventServiceCreateEvent({
      title: 'Test Event Basement 1',
      happenedAt: (Date.now() - 60 * 1000).toString(),
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      description: 'This is a test event.',
      tags: ['test', 'event'],
      roles: ['user'],
    });
    const createEvent2Resp = await adminBasementClient.v1.eventServiceCreateEvent({
      title: 'Test Event Basement 2',
      happenedAt: (Date.now() - 60 * 1000).toString(),
      location: {
        latitude: 38.7749,
        longitude: -122.4194,
      },
      description: 'This is a test event.',
      tags: ['test', 'event'],
      roles: ['admin'],
    });
    await adminBasementClient.v1.relationshipServiceCreateRelationship({
      from: createEvent1Resp.data.event?.id,
      to: createEvent2Resp.data.event?.id,
      name: 'RELATED_TO',
    });

    const userGetEventsResp = await userGeoClient.v1.geoServiceGetEvents({
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    });
    expect(userGetEventsResp.data).toBeDefined();
    expect(userGetEventsResp.data.events).toBeDefined();
    expect(userGetEventsResp.data.events?.length).toBe(1);
    expect(userGetEventsResp.data.relations).toBeDefined();
    expect(userGetEventsResp.data.relations?.length).toBe(0);

    const adminGetEventsResp = await adminGeoClient.v1.geoServiceGetEvents({
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    });
    expect(adminGetEventsResp.data).toBeDefined();
    expect(adminGetEventsResp.data.events).toBeDefined();
    expect(adminGetEventsResp.data.events?.length).toBe(2);
    expect(adminGetEventsResp.data.relations).toBeDefined();
    expect(adminGetEventsResp.data.relations?.length).toBe(1);
  });

  test('should handle unauthorized access to events', async () => {
    expect.assertions(1);

    const unauthorizedClient = new GeoApi({
      baseURL: GEOVISION_API_URL,
    });

    try {
      await unauthorizedClient.v1.geoServiceGetEvents();
    } catch (error: any) {
      expect([401, 403], `Expected 401/403 but got: ${error}`).toContain(error.response?.status);
    }
  });
});
