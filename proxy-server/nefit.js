const NefitEasyClient = require('nefit-easy-core');

let client = null;
let connecting = false;
let connectPromise = null;

const { NEFIT_SERIAL, NEFIT_ACCESS_KEY, NEFIT_PASSWORD } = process.env;

async function getClient() {
  if (client) return client;
  if (connecting) return connectPromise;

  connecting = true;
  connectPromise = (async () => {
    client = NefitEasyClient({
      serialNumber: NEFIT_SERIAL,
      accessKey: NEFIT_ACCESS_KEY,
      password: NEFIT_PASSWORD,
    });
    await client.connect();
    console.log('[Nefit] Verbonden met cv-ketel');
    return client;
  })();

  try {
    await connectPromise;
  } catch (err) {
    client = null;
    connecting = false;
    throw err;
  }

  connecting = false;
  return client;
}

async function getStatus() {
  const c = await getClient();
  return c.status();
}

async function setTemperature(value) {
  const c = await getClient();
  return c.setTemperature(value);
}

async function setUserMode(mode) {
  const c = await getClient();
  return c.setUserMode(mode);
}

// Nefit doesn't expose humidity natively; return null
async function getHumidity() {
  return null;
}

module.exports = { getStatus, setTemperature, setUserMode, getHumidity };
