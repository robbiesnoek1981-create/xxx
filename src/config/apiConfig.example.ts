// ============================================================
//  HOME DASHBOARD — API CONFIGURATIE
//  Vul hier jouw gegevens in voordat je de app bouwt.
//  Bewaar dit bestand NOOIT in een publieke repository.
// ============================================================

export const API_CONFIG = {

  // ----------------------------------------------------------
  // SPOTIFY
  // Stap 1: Ga naar https://developer.spotify.com/dashboard
  // Stap 2: Maak een nieuwe app aan
  // Stap 3: Voeg als Redirect URI toe:
  //         exp://localhost:8081   (Expo Go)
  //         of jouw custom scheme  (gebouwde app)
  // ----------------------------------------------------------
  spotify: {
    clientId: 'JOUW_SPOTIFY_CLIENT_ID',
    redirectUri: 'exp://localhost:8081',
    scopes: [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
    ],
  },

  // ----------------------------------------------------------
  // SOLAREDGE
  // Stap 1: Log in op https://monitoring.solaredge.com
  // Stap 2: Ga naar Admin > Site Access > API Access
  // Stap 3: Kopieer je Site ID en API Key
  // ----------------------------------------------------------
  solarEdge: {
    apiKey: 'JOUW_SOLAREDGE_API_KEY',
    siteId: 'JOUW_SITE_ID',             // bijv. "1234567"
    baseUrl: 'https://monitoringapi.solaredge.com',
  },

  // ----------------------------------------------------------
  // WIZ VERLICHTING (via lokale proxy server)
  // De proxy draait op je thuisnetwerk (Raspberry Pi, Mac, PC)
  // Zie proxy-server/README.md voor installatie-instructies
  // ----------------------------------------------------------
  wiz: {
    proxyUrl: 'http://192.168.1.xxx:3001',  // IP van je proxy server
    // Vul de IP-adressen van je WiZ lampen in per kamer
    rooms: {
      woonkamer: ['192.168.1.100', '192.168.1.101'],
      keuken:    ['192.168.1.102'],
      slaapkamer:['192.168.1.103'],
      badkamer:  ['192.168.1.104'],
      studeerkamer: ['192.168.1.105'],
      gang:      ['192.168.1.106'],
    } as Record<string, string[]>,
  },

  // ----------------------------------------------------------
  // NEFIT / BOSCH THERMOSTAAT (via lokale proxy server)
  // Gebruik de inloggegevens van de Nefit Easy app
  // Let op: gebruik NIET je Bosch account, maar de Nefit Easy credentials
  // ----------------------------------------------------------
  nefit: {
    proxyUrl: 'http://192.168.1.xxx:3001',  // zelfde proxy als WiZ
    serialNumber: 'JOUW_SERIENUMMER',        // staat op de cv-ketel
    accessKey: 'JOUW_ACCESS_KEY',            // staat in de Nefit Easy app
    password: 'JOUW_WACHTWOORD',
  },

};
