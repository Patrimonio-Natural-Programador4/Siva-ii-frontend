import { EnvironmentConfiguration } from 'src/app/models/environment-configuration';

export const environment: EnvironmentConfiguration = {
  env_name: 'prod',
  production: true,
  development: false,
  apiUrl: '',
  apiUrl2: '',
  URLClient: '',
  baseUrl: '',
  useHash: false,
  apiEndpoints: {
    userProfile: 'user-profiles',
  },
  adConfig: {
    redirectUri: 'https://<YOUR_PROD_DOMAIN>/auth/login', // Update with real prod URL
    clientId: '894f2a01-2c10-4f30-8a78-f13e1b6cbc3c',
    tenantId: '6f667010-1080-4683-bd88-6c9b8a912cc7',
    readScopeUrl: 'api://3c9eb084-f576-470c-a20b-44d576cdc891/access_as_user',
    writeScopeUrl: 'api://3c9eb084-f576-470c-a20b-44d576cdc891/access_as_user',
    scopeUrls: ['api://3c9eb084-f576-470c-a20b-44d576cdc891/access_as_user'],
    apiEndpointUrl: 'https://<YOUR_PROD_API_URL>/api',
  },
  cacheTimeInMinutes: 30,
};
