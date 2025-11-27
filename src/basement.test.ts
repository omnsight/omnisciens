import axios from 'axios';
import {
  Api as BasementApi,
  V1Event,
  V1Person,
  V1Organization,
} from '@omnsight/clients/src/omnibasement/omnibasement.js';
import { KeyCloakClientHelper } from './localtest.js';

// --- CONFIGURATION ---
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const BASEMENT_API_URL = process.env.BASEMENT_API_URL;
const REALM = 'omni';
const CLIENT_ID = 'omnibasement';
const CLIENT_SECRET = `${CLIENT_ID}-secret`;

// Fail fast if env is missing
if (!KEYCLOAK_URL || !BASEMENT_API_URL) {
  throw new Error('Missing required environment variables: KEYCLOAK_URL or BASEMENT_API_URL');
}

describe('Omnibasement Service Tests', () => {
  let userBasementClient: BasementApi<any>;
  let adminBasementClient: BasementApi<any>;

  const testUser = {
    username: 'baseuser',
    firstName: 'BaseUser',
    lastName: 'Omni',
    email: 'baseuser@omni.com',
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
    username: 'baseadmin',
    firstName: 'BaseAdmin',
    lastName: 'Omni',
    email: 'baseadmin@omni.com',
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
    const testRole = await kchelper.addRoleToUser(REALM, 'omnibasement', 'user', testUserID);
    console.log(`✅ Created user: ${testUser.username}`);
    console.log(`   User ID: ${testUserID}`);
    console.log(`   Attached role: ${testRole.name}(${testRole.id})`);
    const testUserLoginClient = new KeyCloakClientHelper(REALM);
    const userAuthToken = await testUserLoginClient.auth(CLIENT_ID, CLIENT_SECRET, testUser.username, 'password123');
    console.log(`   Retrieved JWT auth token: ${userAuthToken}`);
    userBasementClient = new BasementApi({
      baseURL: BASEMENT_API_URL,
      headers: {
        Authorization: `Bearer ${userAuthToken}`,
        'Content-Type': 'application/json',
      },
    });

    const adminUserID = await kchelper.createUser(REALM, adminUser);
    const adminRole = await kchelper.addRoleToUser(REALM, 'omnibasement', 'admin', adminUserID);
    console.log(`✅ Created user: ${adminUser.username}`);
    console.log(`   User ID: ${adminUserID}`);
    console.log(`   Attached role: ${adminRole.name}(${adminRole.id})`);
    const adminUserLoginClient = new KeyCloakClientHelper(REALM);
    const adminAuthToken = await adminUserLoginClient.auth(CLIENT_ID, CLIENT_SECRET, adminUser.username, 'password123');
    console.log(`   Retrieved JWT auth token: ${adminAuthToken}`);
    adminBasementClient = new BasementApi({
      baseURL: BASEMENT_API_URL,
      headers: {
        Authorization: `Bearer ${adminAuthToken}`,
        'Content-Type': 'application/json',
      },
    });
  });

  // ----------------------------------------------------------------
  // HAPPY PATH TESTS
  // ----------------------------------------------------------------

  test('should create and get events', async () => {
    try {
      const eventData: V1Event = {
        title: 'Test Event Basement 1',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        description: 'This is a test event.',
        tags: ['test', 'event'],
        roles: ['user'],
      };

      const createResponse = await adminBasementClient.v1.eventServiceCreateEvent(eventData);

      const createdEvent = createResponse.data;

      expect(createdEvent).toBeDefined();
      expect(createdEvent.event?.title).toBe(eventData.title);
      expect(createdEvent.event?.id).toBeDefined();
      expect(createdEvent.event?.key).toBeDefined();

      const createdEventKey = createdEvent.event?.key;

      if (!createdEventKey) throw new Error('Person created but returned no key');

      const getResponse = await userBasementClient.v1.eventServiceGetEvent(createdEventKey);
      const fetchedEvent = getResponse.data;

      expect(fetchedEvent.event?.title).toBe(eventData.title);
      await adminBasementClient.v1.eventServiceGetEvent(createdEventKey);

      const updateResponse = await adminBasementClient.v1.eventServiceUpdateEvent(createdEventKey, {roles: ['admin']});
      expect(updateResponse.data.event?.roles).toContain('admin');

      await adminBasementClient.v1.eventServiceDeleteEvent(createdEventKey);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw Error(`Expected no errors but got: ${error.message}\n${JSON.stringify(error.response?.data)}`);
      } else {
        throw error;
      }
    }
  });

  test('should create and get a person entity', async () => {
    try {
      const personData: V1Person = {
        name: 'Test Person',
        role: 'Developer',
        nationality: 'US',
        tags: ['test', 'person'],
        roles: ['user'],
      };

      const createResponse = await adminBasementClient.v1.personServiceCreatePerson(personData);

      const createdPerson = createResponse.data;

      expect(createdPerson).toBeDefined();
      expect(createdPerson.person?.name).toBe(personData.name);
      expect(createdPerson.person?.id).toBeDefined();
      expect(createdPerson.person?.key).toBeDefined();

      const createdEventKey = createdPerson.person?.key;

      if (!createdEventKey) throw new Error('Person created but returned no key');

      const getResponse = await userBasementClient.v1.personServiceGetPerson(createdEventKey);
      const fetchedPerson = getResponse.data;

      expect(fetchedPerson.person?.name).toBe(personData.name);
      expect(fetchedPerson.person?.role).toBe(personData.role);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw Error(`Expected no errors but got: ${error.message}\n${JSON.stringify(error.response?.data)}`);
      } else {
        throw error;
      }
    }
  });

  test('should create and get an organization entity', async () => {
    try {
      const orgData: V1Organization = {
        name: 'Test Organization',
        type: 'Company',
        tags: ['test', 'organization'],
        roles: ['user'],
      };
      const createResponse = await adminBasementClient.v1.organizationServiceCreateOrganization(orgData);

      const createdOrg = createResponse.data;

      expect(createdOrg).toBeDefined();
      expect(createdOrg.organization?.name).toBe(orgData.name);
      expect(createdOrg.organization?.key).toBeDefined();

      const createdOrgKey = createdOrg.organization?.key;

      if (!createdOrgKey) throw new Error('Organization created but returned no key');

      const getResponse = await userBasementClient.v1.organizationServiceGetOrganization(createdOrgKey);
      const fetchedOrg = getResponse.data;

      expect(fetchedOrg.organization?.name).toBe(orgData.name);
      expect(fetchedOrg.organization?.type).toBe(orgData.type);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw Error(`Expected no errors but got: ${error.message}\n${JSON.stringify(error.response?.data)}`);
      } else {
        throw error;
      }
    }
  });

  // ----------------------------------------------------------------
  // ERROR PATH TESTS
  // ----------------------------------------------------------------

  test('should handle user access non-permessive data (403)', async () => {
    const eventData: V1Event = {
      title: 'Test Event Basement 2',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
      description: 'This is a test event.',
      tags: ['test', 'event'],
      roles: [],
    };

    const createResponse = await adminBasementClient.v1.eventServiceCreateEvent(eventData);

    const createdEvent = createResponse.data;

    expect(createdEvent).toBeDefined();
    expect(createdEvent.event?.title).toBe(eventData.title);
    expect(createdEvent.event?.id).toBeDefined();
    expect(createdEvent.event?.key).toBeDefined();

    const createdEventKey = createdEvent.event?.key;

    if (!createdEventKey) throw new Error('Person created but returned no key');

    try {
      await userBasementClient.v1.eventServiceGetEvent(createdEventKey);
    } catch (error: any) {
      expect(error.response?.status, `Expected 403 but got: ${error}`).toBe(403);
    }
  });

  test('should handle unauthorized user access data (401)', async () => {
    expect.assertions(1);
    const personData: V1Person = {
      name: 'Test Lancer',
      role: 'Free Lancer',
      nationality: 'US',
      tags: ['test', 'person'],
      roles: ['user'],
    };

    try {
      await userBasementClient.v1.personServiceCreatePerson(personData);
    } catch (error: any) {
      expect(error.response?.status, `Expected 401 but got: ${error}`).toBe(401);
    }
  });

  test('should handle unauthorized access (401)', async () => {
    expect.assertions(1); // Ensure strict checking

    // Create a client intentionally without auth headers
    const unauthorizedClient = new BasementApi({
      baseURL: BASEMENT_API_URL,
    });

    try {
      await unauthorizedClient.v1.personServiceCreatePerson({
        name: 'Unauthorized Test Person',
      });
    } catch (error: any) {
      expect([401, 403], `Expected 401/403 but got: ${error}`).toContain(error.response?.status);
    }
  });

  test('should handle invalid entity key when fetching (404)', async () => {
    expect.assertions(1);

    try {
      await userBasementClient.v1.personServiceGetPerson('invalid-person-key-999');
    } catch (error: any) {
      // Check for 404 specifically, rather than just "toBeDefined"
      expect(error.response?.status, `Expected 404 but got: ${error}`).toBe(404);
    }
  });
});
