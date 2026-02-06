import Keycloak from 'keycloak-js';

// Musíte použít 'export const', aby fungovaly složené závorky { keycloak } při importu
export const keycloak = new Keycloak({
    url: 'http://localhost:8091',
    realm: 'TRIPS-APP',
    clientId: 'web-app'
});