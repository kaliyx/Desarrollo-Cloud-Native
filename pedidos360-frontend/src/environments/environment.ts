export const environment = {
  production: false,
  azure: {
    clientId: 'TU_CLIENT_ID_AZURE',
    tenantId: 'TU_TENANT_ID_AZURE',
    redirectUri: 'http://localhost:4200',
    apiScope: 'api://TU_CLIENT_ID_AZURE/access_as_user',
    apiEndpoint: 'http://localhost:8080'
  }
};
