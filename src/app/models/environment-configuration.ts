export interface EnvironmentConfiguration {
    env_name: string;
    production: boolean;
    development?: boolean;
    apiUrl: string;
    apiUrl2: string;
    URLClient: string;
    baseUrl?: string;
    useHash?: boolean;
    apiEndpoints: {
        userProfile: string;      
    },
    adConfig: {
        redirectUri: string;
        clientId: string;
        tenantId:string;
        readScopeUrl: string;
        scopeUrls:string[];
        writeScopeUrl: string;
        apiEndpointUrl: string;
    }
    cacheTimeInMinutes: number;
}