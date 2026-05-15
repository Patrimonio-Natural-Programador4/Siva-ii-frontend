import { EnvironmentConfiguration } from "src/app/models/environment-configuration";

const serverUrl='https://localhost:44351/api';
const serverUrl2='http://localhost:8111/api';
const URLClient="";

// export const environment = {
//   production: false,
//   baseUrl: '',
//   useHash: false,
// };


export const environment: EnvironmentConfiguration = {
  env_name: 'dev',
  production: false,
  development: true,
  apiUrl: serverUrl,
  apiUrl2: serverUrl2,
  URLClient: URLClient,
  baseUrl: '',
  useHash: false,
  apiEndpoints: {
    userProfile:'user-profiles'
  },
  adConfig: {
    redirectUri: 'http://localhost:4200/auth/login',
    clientId: '6334ea41-2b5c-42b8-9d4f-15c64895d812',
    readScopeUrl: 'api://3789c93c-1e71-488f-acc5-51afb52dd9a3/acces_as_user/acces_as_user',
    writeScopeUrl: 'api://3789c93c-1e71-488f-acc5-51afb52dd9a3/acces_as_user/acces_as_user',
    scopeUrls: [
      'api://3789c93c-1e71-488f-acc5-51afb52dd9a3/acces_as_user/acces_as_user',
      'api://3789c93c-1e71-488f-acc5-51afb52dd9a3/acces_as_user/acces_as_user'
    ],
    apiEndpointUrl: 'http://localhost:8111/api',
    tenantId: "138a1799-f2e2-4902-b2a1-0ca7278eb49b"
  },
  cacheTimeInMinutes: 30,
};