import KcAdminClient from '@keycloak/keycloak-admin-client';
import CredentialRepresentation from '@keycloak/keycloak-admin-client/lib/defs/credentialRepresentation.js';
import RoleRepresentation from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation.js';
import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation.js';
import esMain from 'es-main';

export class KeyCloakClientHelper {
  private adminClient: KcAdminClient;

  constructor(realm: string = 'master') {
    if (!process.env.KEYCLOAK_URL) {
      throw new Error('KEYCLOAK_URL environment variable is not set');
    }

    if (!process.env.AUTH_SERVICE_URL) {
      throw new Error('AUTH_SERVICE_URL environment variable is not set');
    }

    if (!process.env.BASEMENT_API_URL) {
      throw new Error('BASEMENT_API_URL environment variable is not set');
    }

    if (!process.env.GEOVISION_API_URL) {
      throw new Error('GEOVISION_API_URL environment variable is not set');
    }

    this.adminClient = new KcAdminClient({
      baseUrl: process.env.KEYCLOAK_URL,
      realmName: realm,
    });
  }

  async auth_admin() {
    await this.adminClient.auth({
      username: 'admin',
      password: 'admin',
      grantType: 'password',
      clientId: 'admin-cli',
    });
  }

  async auth(clientId: string, clientSecret: string, username: string, password: string): Promise<string> {
    await this.adminClient.auth({
      grantType: 'password',
      clientId: clientId,
      clientSecret: clientSecret,
      username: username,
      password: password,
    });

    if (!this.adminClient.accessToken) {
      throw new Error('Failed to retrieve user access token');
    }

    return this.adminClient.accessToken;
  }

  async createRealm(realm: string) {
    try {
      await this.adminClient.realms.create({
        realm: realm,
        enabled: true,
      });
      console.log(`✅ Created realm: ${realm}`);
      return realm;
    } catch (error: any) {
      if (error.message.includes('Conflict')) {
        console.log(`⚠️ Realm ${realm} already exists. Skipping.`);
        return realm;
      } else {
        throw error;
      }
    }
  }

  async createServiceAccount(realm: string, clientName: string): Promise<[string, CredentialRepresentation]> {
    const existingClients = await this.adminClient.clients.find({ realm, clientId: clientName });
    if (existingClients.length > 0) {
      throw new Error(`⚠️ Client ${clientName} already exists. Skipping.`);
    }

    const createdClient = await this.adminClient.clients.create({
      realm,
      clientId: clientName,
      enabled: true,
      secret: `${clientName}-secret`,
      // Enables the "Service Account" feature
      serviceAccountsEnabled: true,
      standardFlowEnabled: false,
      // Disable browser login (optional but recommended for pure services)
      directAccessGrantsEnabled: true,
      publicClient: false,
      bearerOnly: false,
    });

    if (!createdClient.id) {
      throw new Error(`Failed to retrieve ID for ${clientName}`);
    }

    const secretData = await this.adminClient.clients.getClientSecret({
      realm,
      id: createdClient.id,
    });

    return [createdClient.id, secretData];
  }

  async addRoleToClient(realm: string, clientId: string, role: string): Promise<RoleRepresentation> {
    const serviceAccountUser = await this.adminClient.clients.getServiceAccountUser({
      id: clientId, // Use the UUID returned from create()
      realm: realm,
    });

    const realmManagementClients = await this.adminClient.clients.find({
      clientId: 'realm-management', // Use the specific name
      realm: realm,
    });
    const realmManagementClient = realmManagementClients[0];

    if (!realmManagementClient) {
      throw new Error('Could not find realm-management client');
    }

    const roleToAssign = await this.adminClient.clients.findRole({
      id: realmManagementClient.id!, // UUID of realm-management
      roleName: role,
      realm: realm,
    });

    if (!roleToAssign) {
      throw new Error(`Could not find role: ${role}`);
    }

    await this.adminClient.users.addClientRoleMappings({
      id: serviceAccountUser.id!, // The Service Account User UUID
      clientUniqueId: realmManagementClient.id!, // The realm-management UUID
      roles: [
        {
          id: roleToAssign.id!,
          name: roleToAssign.name!,
        }
      ],
      realm: realm,
    });
    return roleToAssign;
  }

  async createClientRole(realm: string, clientId: string, role: string) {
    return await this.adminClient.clients.createRole({
      id: clientId, // The UUID of the client
      realm: realm,
      name: role,
      description: `Custom role ${role}`,
      clientRole: true,
    });
  }

  async createUser(realm: string, user: UserRepresentation): Promise<string> {
    const response = await this.adminClient.users.create({
      realm: realm,
      ...user,
    });
    return response.id;
  }

  async addRoleToUser(realm: string, clientName: string, roleName: string, userId: string): Promise<RoleRepresentation> {
    const clients = await this.adminClient.clients.find({ realm, clientId: clientName });
    const clientUUID = clients[0]?.id;
    if (!clientUUID) throw new Error(`Client '${clientName}' not found`);

    const role = await this.adminClient.clients.findRole({
      id: clientUUID,
      roleName,
      realm,
    });
    if (!role) throw new Error(`Role '${roleName}' not found`);

    await this.adminClient.users.addClientRoleMappings({
      id: userId,
      clientUniqueId: clientUUID,
      realm,
      roles: [{
        id: role.id!,
        name: role.name!
      }]
    });

    return role;
  }
}

async function main() {
  const helper = new KeyCloakClientHelper();
  await helper.auth_admin();  
  console.log('✅ Authenticated as Admin');
  const realm = await helper.createRealm('omni');
  console.log('-----------------------------------');

  const serviceAccountsToCreate = ['omniauth', 'omnibasement', 'geovision'];
  for (const name of serviceAccountsToCreate) {
    const [clientId, secretData] = await helper.createServiceAccount(realm, name);
    console.log(`✅ Created Service Account: ${name}`);
    console.log(`   Client ID:     ${clientId}`);
    console.log(`   Client Secret: ${secretData.value}`);
    const attachedRole = await helper.addRoleToClient(realm, clientId, 'view-users');
    console.log(`   Attached Roles: ${attachedRole.name}(${attachedRole.id})`);
    const adminRole = await helper.createClientRole(realm, clientId, 'admin');
    const userRole = await helper.createClientRole(realm, clientId, 'user');
    console.log(`   Client Roles: ${adminRole.roleName}, ${userRole.roleName}`);
    console.log('-----------------------------------');
  }

  console.log('✅ Keycloak setup completed!');
}

if (esMain(import.meta)) {
  main().catch(error => {
    console.error('❌ Error setting up Keycloak:', error);
    process.exit(1);
  });
}
