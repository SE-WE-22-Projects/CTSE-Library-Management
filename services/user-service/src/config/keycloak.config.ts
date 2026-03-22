import {
  KeycloakConnectConfig,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

export const keycloakConfig = (): KeycloakConnectConfig => ({
  authServerUrl: process.env['AUTH_URL']!,
  realm: process.env['AUTH_REALM']!,
  clientId: process.env['AUTH_CLIENT']!,
  secret: process.env['AUTH_SECRET']!,
  policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
  tokenValidation: TokenValidation.OFFLINE,
  logLevels: ['error'],
});
